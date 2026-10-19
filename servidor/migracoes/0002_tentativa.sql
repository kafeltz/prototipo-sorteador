-- Quando o servidor tentou calcular o resultado pela última vez. Serve de
-- trava: no máximo uma tentativa a cada 30 segundos por sorteio, por mais
-- que muita gente abra a página ao mesmo tempo (ou o farol esteja fora).
ALTER TABLE sorteios ADD COLUMN tentativa_em TEXT;
