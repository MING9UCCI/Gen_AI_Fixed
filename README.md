# 🎮 생성형 AI의 활용전략 — 중간고사 시뮬레이션

「생성형 AI의 활용전략」 중간고사 범위(제1·2·4장)를 픽셀아트 게임으로 복습하는
**50문제 모의고사 시뮬레이션**입니다. 브라우저에서 바로 실행됩니다.

> ▶ **바로 플레이**: `https://<사용자명>.github.io/<저장소명>/`
> (배포 후 위 링크를 실제 주소로 바꿔 주세요)

![타이틀 화면](screenshot.png)

## ✨ 특징

- **4가지 모드** — 전체 50문제(챕터 비율 배합: 객관식 24 · 단답식 16 · OX 10) + 챕터별 25문제 × 3
- **문항 유형** — 객관식 · OX · 단답식(예시 정답 확인 후 자가 채점)
- ⏱ **타이머** — 객관식 30초 · OX 20초 · 단답식 45초, 마지막 5초 틱음, 초과 시 자동 오답 처리 (토글로 OFF 가능)
- 🔊 **칩튠 효과음** — 정답·오답·3연속 스트릭·타임업·결과 멜로디 (Web Audio API 합성, 외부 음원 파일 없음)
- 😍 **점수별 캐릭터 표정 6단계** — 90↑ 환희 / 80↑ 득의양양 / 70↑ 결의 / 60↑ 경악 / 40↑ 졸림 / 그 밑에 오열
- 매 실행마다 **새 랜덤 구성 + 선택지 셔플**, 문항마다 **해설 + 리뷰 PDF 위치 표기**
- 결과 화면에 **챕터별 정답률 막대 + 틀린 문항 리뷰 모드**, 키보드 조작 지원(1~4, O/X, Enter)

## 🗂 저장소 구성

```
index.html    ← 시뮬레이션 본체 (단일 파일 — 이미지·음향 전부 내장)
pdfs/         ← 챕터별 모의고사 PDF 3종
.nojekyll     ← GitHub Pages Jekyll 처리 비활성화
screenshot.png / README.md
```

## 🚀 GitHub Pages 배포 방법

### 방법 A — 웹에서 클릭만으로 (추천)

1. GitHub 로그인 → 우측 상단 **+** → **New repository**
2. 저장소명 입력(예: `midterm-sim`) → **Public** 선택 → **Create repository**
3. 저장소 화면의 **"uploading an existing file"** 링크 클릭
4. 이 폴더의 `index.html`, `README.md`, `.nojekyll`, `pdfs/`(폴째로), `screenshot.png`를 **모두 드래그** → **Commit changes**
5. **Settings → Pages** → Source: **Deploy from a branch** → Branch: **main** / **/(root)** → **Save**
6. 1~2분 후 `https://<사용자명>.github.io/<저장소명>/` 이 열리면 완료 🎉

### 방법 B — git CLI

```bash
git init
git add .
git commit -m "중간고사 시뮬레이션 v2 (타이머·효과음)"
git branch -M main
git remote add origin https://github.com/<사용자명>/<저장소명>.git
git push -u origin main
# 이후 웹에서 Settings → Pages → main /(root) 선택
```

> 💡 저장소명을 `<사용자명>.github.io` 로 만들면 주소 루트(`/`)에서 바로 서비스됩니다.

## 📄 모의고사 PDF (문제 → 정답 → 해설 + 리뷰 PDF 위치 표기)

| 챕터 | 문항 구성 | 파일 |
|---|---|---|
| 제1장 생성형 AI의 개념 및 작동원리 | 객관식 12 · OX 5 · 단답식 8 | [pdfs/mock-exam-ch1.pdf](pdfs/mock-exam-ch1.pdf) |
| 제2장 프롬프트 엔지니어링의 이해와 개념 | 객관식 12 · OX 5 · 단답식 8 | [pdfs/mock-exam-ch2.pdf](pdfs/mock-exam-ch2.pdf) |
| 제4장 대학생을 위한 프롬프트 활용 | 객관식 12 · OX 5 · 단답식 8 | [pdfs/mock-exam-ch4.pdf](pdfs/mock-exam-ch4.pdf) |

## 🛠 기술 노트

- 순수 HTML/CSS/JS **단일 파일** — 빌드·설치 없이 정적 호스팅 어디서든 동작
- 픽셀 폰트: [Galmuri](https://github.com/quiple/galmuri) (jsDelivr CDN) / 캐릭터·배경 이미지: base64 내장
- 효과음: Web Audio API 오실레이터 합성 — 저작권 걱정 없는 자체 생성음
- 문제 출처: 강의 「중간고사 리뷰」 요약 PDF(1·2·4장) 기반 자체 제작 문항
