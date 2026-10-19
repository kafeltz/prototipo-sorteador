-- Um sorteio verificável publicado. Os nomes estão no lacre, que é público
-- de propósito: sem a lista, ninguém confere (docs/decisoes/0003).
CREATE TABLE sorteios (
  id         TEXT PRIMARY KEY,     -- código aleatório do endereço /s/<id>
  impressao  TEXT NOT NULL UNIQUE, -- impressão digital do lacre
  lacre      TEXT NOT NULL,        -- o lacre, no formato oficial
  rodada     INTEGER NOT NULL,     -- a rodada do farol que decide
  criado_em  TEXT NOT NULL,        -- data e hora em UTC (ISO 8601)
  apagar_em  TEXT NOT NULL,        -- 90 dias depois do horário do sorteio
  resultado  TEXT                  -- JSON, preenchido depois que a rodada sai
);

-- A limpeza diária procura pela data de apagar
CREATE INDEX sorteios_apagar_em ON sorteios (apagar_em);
