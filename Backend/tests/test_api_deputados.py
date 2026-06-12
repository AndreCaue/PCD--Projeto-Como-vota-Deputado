import pytest
from fastapi.testclient import TestClient


class TestDeputadosEmpresas:
    def test_list_deputados_empresas_endpoint_exists(
        self, client: TestClient
    ):
        response = client.get("/deputados/empresas")
        assert response.status_code == 200

    def test_list_deputados_empresas_response_shape(
        self, client: TestClient, sample_deputado, sample_partido
    ):
        response = client.get("/deputados/empresas")
        assert response.status_code == 200
        body = response.json()
        assert "data" in body
        assert "meta" in body
        assert "freshness" in body
        meta = body["meta"]
        assert "total" in meta
        assert "page" in meta
        assert "limit" in meta
        assert "totalPages" in meta
        if len(body["data"]) > 0:
            item = body["data"][0]
            assert "id" in item
            assert "nome" in item
            assert "partido" in item
            assert "estado" in item
            assert "total_empresas" in item

    def test_list_deputados_empresas_pagination(
        self, client: TestClient
    ):
        response = client.get("/deputados/empresas?page=1&limit=10")
        assert response.status_code == 200
        body = response.json()
        assert body["meta"]["page"] == 1
        assert body["meta"]["limit"] == 10

    def test_list_deputados_empresas_filter_partido(
        self, client: TestClient, sample_deputado, sample_partido
    ):
        response = client.get("/deputados/empresas?partido=PT")
        assert response.status_code == 200

    def test_get_empresas_deputado_freshness(
        self, client: TestClient, sample_deputado, sample_qsa_metadata
    ):
        response = client.get(f"/deputados/{sample_deputado.id}/empresas")
        assert response.status_code in (200, 404)
        if response.status_code == 200:
            body = response.json()
            assert "data" in body
            assert "freshness" in body
            freshness = body["freshness"]
            assert "qsa_data_disponivel" in freshness


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
            body = response.json()
            assert "data" in body
            assert "freshness" in body
            assert isinstance(body["data"], list)

    def test_get_empresas_not_found(self, client: TestClient):
        response = client.get("/deputados/999999/empresas")
        assert response.status_code == 404

    def test_relationship_type_field(self, client: TestClient, sample_deputado):
        response = client.get(f"/deputados/{sample_deputado.id}/empresas")
        if response.status_code == 200:
            body = response.json()
            data = body["data"]
            if len(data) > 0:
                item = data[0]
                assert "relationship_type" in item or "tipo_relacao" in item

    def test_confidence_score_field(self, client: TestClient, sample_deputado):
        response = client.get(f"/deputados/{sample_deputado.id}/empresas")
        if response.status_code == 200:
            body = response.json()
            data = body["data"]
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
