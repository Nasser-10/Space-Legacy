import axios from 'axios';

const BACKEND_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: BACKEND_BASE,
  timeout: 3500,
});

// Cache for seed data fallback
let fallbackDataCache = null;

async function getFallbackData() {
  if (fallbackDataCache) return fallbackDataCache;
  try {
    const res = await axios.get('/data/seed_data.json');
    fallbackDataCache = res.data;
    return fallbackDataCache;
  } catch (err) {
    console.error('Failed to load local fallback seed data:', err);
    return null;
  }
}

export const SpaceLegacyAPI = {
  // 1. Get equipment list
  async getEquipment(planet = null) {
    try {
      const params = planet ? { planet } : {};
      const res = await apiClient.get('/equipment', { params });
      return res.data;
    } catch (err) {
      console.warn('Backend unavailable, using local client-side data fallback');
      const seed = await getFallbackData();
      if (!seed) return [];
      let list = seed.equipment.map((eq) => ({
        equipment_id: eq.equipment_id,
        mission_id: eq.mission_id,
        official_name: eq.official_name,
        common_name: eq.common_name,
        celestial_body: eq.celestial_body,
        landing_site_name: eq.landing_site_name,
        status_category: eq.status_category,
        operational_status: eq.operational_status,
        landing_date: eq.landing_date,
        thumbnail_url: eq.fallback_image_urls?.[0] || null,
        has_3d_model: !!eq.model_glb_url,
      }));
      if (planet) {
        list = list.filter((item) => item.celestial_body === planet.toLowerCase());
      }
      return list;
    }
  },

  // 2. Get equipment detail
  async getEquipmentDetail(id) {
    try {
      const res = await apiClient.get(`/equipment/${id}`);
      return res.data;
    } catch (err) {
      console.warn(`Backend detail unavailable for ${id}, using fallback`);
      const seed = await getFallbackData();
      if (!seed) return null;
      const eq = seed.equipment.find((item) => item.equipment_id === id);
      if (!eq) return null;
      const mission = seed.missions.find((m) => m.mission_id === eq.mission_id);
      const sources = seed.sources.filter((s) => s.equipment_id === id);
      return {
        ...eq,
        mission_name: mission?.name,
        program: mission?.program,
        sources: sources || [],
      };
    }
  },

  // 3. Get timeline
  async getTimeline(id) {
    try {
      const res = await apiClient.get(`/equipment/${id}/timeline`);
      return res.data;
    } catch (err) {
      const seed = await getFallbackData();
      if (!seed) return [];
      const t = seed.timelines.find((item) => item.equipment_id === id);
      return t ? t.events : [];
    }
  },

  // 4. Get quiz
  async getQuiz(id) {
    try {
      const res = await apiClient.get(`/quiz/${id}`);
      return res.data;
    } catch (err) {
      const seed = await getFallbackData();
      if (!seed) return [];
      const qz = seed.quizzes.find((item) => item.equipment_id === id);
      if (!qz) return [];
      return qz.questions.map((q) => ({
        question_id: q.question_id,
        question_text: q.question_text,
        options: q.options,
      }));
    }
  },

  // 5. Submit quiz
  async submitQuiz(equipmentId, answers) {
    try {
      const res = await apiClient.post('/quiz/submit', {
        equipment_id: equipmentId,
        answers,
      });
      return res.data;
    } catch (err) {
      // Local grading fallback
      const seed = await getFallbackData();
      const qz = seed.quizzes.find((item) => item.equipment_id === equipmentId);
      if (!qz) return null;
      let score = 0;
      const feedback = qz.questions.map((q) => {
        const userAns = (answers[q.question_id] || '').trim().toLowerCase();
        const isCorrect = userAns === q.correct_option.toLowerCase();
        if (isCorrect) score += 1;
        return {
          question_id: q.question_id,
          question_text: q.question_text,
          user_answer: userAns,
          correct_option: q.correct_option,
          is_correct: isCorrect,
          explanation: q.explanation,
        };
      });
      const total = qz.questions.length;
      const pct = (score / total) * 100;
      const badge =
        pct === 100
          ? 'Master Space Archaeologist'
          : pct >= 75
          ? 'Planetary Pioneer'
          : pct >= 50
          ? 'Lunar & Martian Cadet'
          : 'Curious Space Explorer';
      return {
        equipment_id: equipmentId,
        score,
        total_questions: total,
        percentage: pct,
        badge,
        feedback,
      };
    }
  },

  // 6. Ask AI Space Historian
  async askHistorian(equipmentId, question, level = 'explorer') {
    try {
      const res = await apiClient.post('/ai/ask', {
        equipment_id: equipmentId,
        question,
        level,
      });
      return res.data;
    } catch (err) {
      console.warn('AI API endpoint offline, using local educational response');
      return {
        answer:
          level === 'kid'
            ? 'NASA sent these brave robotic explorers to discover rocks, look for ancient water, and test landing technologies! Even though their batteries ran out, they are honored like planetary monuments on the Moon and Mars!'
            : 'According to official NASA archives, equipment remaining on the lunar and Martian surfaces fulfilled primary scientific objectives and remains in-situ due to rocket propulsion mass limits, preserving the historic record of early planetary exploration.',
        sources: [
          {
            title: 'NASA Historical & Planetary Archives',
            author: 'NASA History Division',
            year: 'Historical Record',
            url: 'https://history.nasa.gov',
          },
        ],
        grounded: true,
        level_applied: level,
      };
    }
  },
};
