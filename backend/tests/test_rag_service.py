import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

from app.services.rag_service import RAGService, _answer_has_evidence, _tokens


def service_without_chroma(tmp_path):
    service = RAGService.__new__(RAGService)
    service.collection = None
    service.chroma_client = None
    service.documents_dir = tmp_path
    return service


def test_equipment_selection_does_not_create_keyword_relevance(tmp_path):
    (tmp_path / "apollo_11_descent.md").write_text(
        "# Propulsion\nThe descent engine used hypergolic propellants.", encoding="utf-8"
    )
    service = service_without_chroma(tmp_path)
    service._documents_dir_for_tests = tmp_path
    # The service reads its configured documents path; point settings at this fixture.
    from app.core.config import settings
    original = settings.DOCUMENTS_DIR
    settings.DOCUMENTS_DIR = str(tmp_path)
    try:
        assert service._fallback_keyword_search("tell me about ocean tides", "apollo_11_lm") == []
    finally:
        settings.DOCUMENTS_DIR = original



def test_relevant_query_matches_only_selected_exhibit(tmp_path):
    (tmp_path / "apollo_11_descent.md").write_text(
        "# Propulsion\\nApollo 11 descent engine used hypergolic propellants.", encoding="utf-8"
    )
    (tmp_path / "viking_1_lander.md").write_text(
        "# Power\\nViking 1 used radioisotope generators.", encoding="utf-8"
    )
    service = service_without_chroma(tmp_path)
    from app.core.config import settings
    original = settings.DOCUMENTS_DIR
    settings.DOCUMENTS_DIR = str(tmp_path)
    try:
        assert service._fallback_keyword_search("Apollo descent engine", "apollo_11_lm")
        assert service._fallback_keyword_search("Apollo descent engine", "viking_1") == []
    finally:
        settings.DOCUMENTS_DIR = original


def test_arabic_query_matches_english_archive_terms(tmp_path):
    (tmp_path / "apollo_11_descent.md").write_text(
        "# Apollo 11\\nThe lunar landing stage remained on the Moon.", encoding="utf-8"
    )
    service = service_without_chroma(tmp_path)
    from app.core.config import settings
    original = settings.DOCUMENTS_DIR
    settings.DOCUMENTS_DIR = str(tmp_path)
    try:
        assert service._fallback_keyword_search("أبولو والقمر", "apollo_11_lm")
    finally:
        settings.DOCUMENTS_DIR = original


def test_arabic_and_english_tokenization():
    assert "أبولو" in _tokens("ما هي مهمة أبولو 11؟")
    assert "moon" in _tokens("ما أهمية الهبوط على القمر؟")
    assert "mars" in _tokens("ماذا فعل المسبار على المريخ؟")
    assert "apollo" in _tokens("Tell me about Apollo 11")


def test_evidence_check_rejects_unrelated_claims():
    evidence = ["Apollo 11 deployed the Early Apollo Scientific Experiments Package."]
    assert _answer_has_evidence(
        "Apollo 11 deployed the Early Apollo Scientific Experiments Package.", evidence
    )
    assert not _answer_has_evidence(
        "The spacecraft discovered liquid oceans and forests on Mars.", evidence
    )


def test_unknown_source_has_no_fabricated_citation():
    assert RAGService._citation_for("unlisted_document.md") is None

def test_arabic_diacritics_and_alef_variants_are_normalized():
    tokens = _tokens("إِبْرَاهِيم يسأل عن القمر")
    assert "ابراهيم" in tokens
    assert "القمر" in tokens
    assert "moon" in tokens


def test_arabic_alef_variants_match_archive_terms():
    assert _tokens("آبولو") & _tokens("أبولو")
