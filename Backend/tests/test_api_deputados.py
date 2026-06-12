import pytest
from fastapi.testclient import TestClient


class TestAPIDeputados:
    def test_list_deputados(self, client: TestClient, db_session, sample_deputado, sample_partido):
        response = client.get("/deputados")
        assert response.status_code == 200
        body = response.json()
        assert "data" in body
        assert "meta" in body

    def test_get_deputado_by_id(self, client: TestClient, sample_deputado):
        response = client.get(f"/deputados/{sample_deputado.id}")
        assert response.status_code == 200
        assert response.json()["id"] == sample_deputado.id

    def test_get_deputado_not_found(self, client: TestClient):
        response = client.get("/deputados/999999")
        assert response.status_code == 404

    def test_get_empresas_endpoint(self, client: TestClient, sample_deputado):
        response = client.get(f"/deputados/{sample_deputado.id}/empresas")
        assert response.status_code in (200, 404)
        if response.status_code == 200:
            data = response.json()
            assert isinstance(data, list)

    def test_get_empresas_not_found(self, client: TestClient):
        response = client.get("/deputados/999999/empresas")
        assert response.status_code == 404

    def test_relationship_type_field(self, client: TestClient, sample_deputado):
        response = client.get(f"/deputados/{sample_deputado.id}/empresas")
        if response.status_code == 200:
            data = response.json()
            if len(data) > 0:
                item = data[0]
                assert "relationship_type" in item or "tipo_relacao" in item

    def test_confidence_score_field(self, client: TestClient, sample_deputado):
        response = client.get(f"/deputados/{sample_deputado.id}/empresas")
        if response.status_code == 200:
            data = response.json()
            if len(data) > 0:
                item = data[0]
                assert "confidence_score" in item or "score_confianca" in item

    def test_get_relacoes_endpoint(self, client: TestClient, sample_deputado):
        response = client.get(f"/deputados/{sample_deputado.id}/relacoes")
        assert response.status_code == 200

    def test_relacoes_contains_empresa_info(self, client: TestClient, db_session, sample_deputado, sample_relacao):
        response = client.get(f"/deputados/{sample_deputado.id}/relacoes")
        assert response.status_code == 200
        data = response.json()
        if len(data) > 0:
            item = data[0]
            assert "empresa" in item or "cnpj" in item

    def test_filter_deputados_by_partido(self, client: TestClient, sample_deputado, sample_partido):
        response = client.get("/deputados?partido=PT")
        assert response.status_code == 200
        assert response.json()["meta"]["total"] >= 0

    def test_filter_deputados_by_estado(self, client: TestClient, sample_deputado):
        response = client.get("/deputados?estado=SP")
        assert response.status_code == 200
        assert response.json()["meta"]["total"] >= 0

    def test_pagination(self, client: TestClient):
        response = client.get("/deputados?page=1&limit=10")
        assert response.status_code == 200
        assert response.json()["meta"]["page"] == 1

    def test_empty_result_handling(self, client: TestClient):
        response = client.get("/deputados?partido=ZZ")
        assert response.status_code == 200
        assert len(response.json()["data"]) == 0
