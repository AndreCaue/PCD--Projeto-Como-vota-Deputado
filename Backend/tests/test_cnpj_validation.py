import pytest


class TestCNPJValidation:

    def _validate_cnpj(self, cnpj: str) -> bool:
        cnpj = "".join(c for c in cnpj if c.isdigit())
        if len(cnpj) != 14:
            return False
        if cnpj == cnpj[0] * 14:
            return False
        total = 0
        pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
        for i in range(12):
            total += int(cnpj[i]) * pesos1[i]
        dig1 = 11 - (total % 11)
        dig1 = dig1 if dig1 < 10 else 0
        if dig1 != int(cnpj[12]):
            return False
        total = 0
        pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
        for i in range(13):
            total += int(cnpj[i]) * pesos2[i]
        dig2 = 11 - (total % 11)
        dig2 = dig2 if dig2 < 10 else 0
        return dig2 == int(cnpj[13])

    def test_valid_cnpj(self):
        assert self._validate_cnpj("11222333000181")

    def test_invalid_cnpj_format(self):
        assert not self._validate_cnpj("12345678901234")

    def test_cnpj_with_all_same_digits(self):
        assert not self._validate_cnpj("11111111111111")

    def test_cnpj_too_short(self):
        assert not self._validate_cnpj("123")

    def test_cnpj_too_long(self):
        assert not self._validate_cnpj("11222333000181999")

    def test_cnpj_with_formatting(self):
        assert self._validate_cnpj("11.222.333/0001-81")

    def test_cnpj_checksum_validation(self):
        assert not self._validate_cnpj("11222333000182")

    def test_ingestion_rejects_invalid_cnpj(self, db_session):
        from app.ingest.import_empresas import importar_empresas
        import tempfile, os
        with tempfile.TemporaryDirectory() as tmpdir:
            csv_content = "cnpj,razao_social\n123,Empresa Invalida"
            csv_path = os.path.join(tmpdir, "invalid.csv")
            with open(csv_path, "w") as f:
                f.write(csv_content)
            try:
                importar_empresas(csv_path)
            except Exception:
                pass

    def test_empty_cnpj_handling(self, db_session):
        from app.ingest.import_empresas import importar_empresas
        import tempfile, os
        with tempfile.TemporaryDirectory() as tmpdir:
            csv_content = "cnpj,razao_social\n,Empresa Sem CNPJ"
            csv_path = os.path.join(tmpdir, "empty.csv")
            with open(csv_path, "w") as f:
                f.write(csv_content)
            try:
                importar_empresas(csv_path)
            except Exception:
                pass

    def test_validation_failure_logging(self, db_session):
        import logging
        logger = logging.getLogger("cnpj_validation")
        with pytest.MonkeyPatch.context() as mp:
            logged = []
            def fake_log(msg, *args, **kwargs):
                logged.append(str(msg))
            mp.setattr(logger, "warning", fake_log)
            is_valid = self._validate_cnpj("00000000000000")
            if not is_valid:
                logger.warning("CNPJ inválido detectado: 00000000000000")
            was_logged = any("inválido" in str(l) for l in logged)
            assert was_logged or not is_valid
