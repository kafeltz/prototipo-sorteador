"""Segunda implementação da regra do sorteio verificável, em Python.

Não reaproveita nada do JavaScript: foi escrita a partir da descrição da
regra no COMO-FUNCIONA.md. Se as duas implementações chegam aos mesmos
vencedores em todos os vetores de teste, a regra é reproduzível por qualquer
pessoa, em qualquer linguagem, e não um acaso do nosso código.

Uso: python3 testes/segunda-implementacao.py testes/vetores.json
"""

import hashlib
import json
import re
import sys
import unicodedata

CABECALHO = "SORTEIO VERIFICÁVEL (versão 1)"


def limpar(texto):
    texto = unicodedata.normalize("NFC", texto)
    texto = re.sub("[​-‍﻿]", "", texto)
    return re.sub(r"\s+", " ", texto).strip()


def ler_lacre(texto):
    linhas = [limpar(l) for l in texto.splitlines()]
    linhas = [l for l in linhas if l]
    i = linhas.index(CABECALHO)
    total = int(re.fullmatch(r"Participantes \((\d+)\):", linhas[i + 6]).group(1))
    participantes = []
    for n in range(1, total + 1):
        prefixo = f"{n}. "
        assert linhas[i + 6 + n].startswith(prefixo)
        participantes.append(linhas[i + 6 + n][len(prefixo):])
    # O lacre no formato oficial são as linhas do cabeçalho até o último nome
    oficial = "\n".join(linhas[i : i + 7 + total])
    vencedores = int(linhas[i + 4].removeprefix("Vencedores: "))
    sem_repeticao = linhas[i + 5] == "Quem ganhou sai da roda: sim"
    return oficial, participantes, vencedores, sem_repeticao


def sha256_hex(texto):
    return hashlib.sha256(texto.encode("utf-8")).hexdigest()


def numeros_da_semente(semente):
    contador = 0
    while True:
        bloco = hashlib.sha256(f"{semente}:{contador}".encode()).digest()
        for j in range(0, 32, 4):
            yield int.from_bytes(bloco[j : j + 4], "big")
        contador += 1


def sortear(lacre, aleatoriedade):
    oficial, participantes, vencedores, sem_repeticao = ler_lacre(lacre)
    impressao = sha256_hex(oficial)
    semente = sha256_hex(f"{aleatoriedade}:{impressao}")
    numeros = numeros_da_semente(semente)
    na_roda = list(participantes)
    resultado = []
    for _ in range(vencedores):
        limite = (2**32 // len(na_roda)) * len(na_roda)
        numero = next(numeros)
        while numero >= limite:
            numero = next(numeros)
        indice = numero % len(na_roda)
        resultado.append(na_roda[indice])
        if sem_repeticao:
            na_roda.pop(indice)
    return impressao, semente, resultado


def main():
    vetores = json.load(open(sys.argv[1], encoding="utf-8"))
    falhas = 0
    for v in vetores:
        impressao, semente, vencedores = sortear(v["lacre"], v["aleatoriedade"])
        ok = (impressao, semente, vencedores) == (v["impressao"], v["semente"], v["vencedores"])
        falhas += not ok
        print(("ok    " if ok else "FALHA ") + v["descricao"])
    sys.exit(1 if falhas else 0)


if __name__ == "__main__":
    main()
