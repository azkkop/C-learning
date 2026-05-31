# C# 터미널 게임 프로그래밍 학습

브라우저에서 C# 콘솔 프로그래밍을 연습하고 자동 채점하는 정적 웹 학습 사이트입니다.  
**Cloudflare Pages** 배포에 최적화되어 있습니다.

## 기능

- 20개 스테이지 (반복문, 조건문, 배열, 입출력)
- 가상 콘솔 에뮬레이터 + 자동 테스트
- 코드 자동 저장 (localStorage)
- 진행률 추적
- URL 스테이지 공유 (`?stage=3`)
- 모바일 탭 UI (문제 / 코드 / 결과)

## 로컬 실행

```bash
# Python 내장 서버
python -m http.server 8080

# Cloudflare Pages 로컬 미리보기 (Wrangler)
npm install
npm run preview
```

브라우저에서 `http://localhost:8080` 접속

---

## Cloudflare Pages 배포

### 방법 A — GitHub 연동 (권장)

1. [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. GitHub 저장소 `azkkop/programming-learning` 선택
3. 빌드 설정:

| 항목 | 값 |
|------|-----|
| Framework preset | **None** |
| Build command | *(비워두기)* |
| Build output directory | **`.`** (프로젝트 루트) |

4. **Save and Deploy** 클릭
5. 배포 완료 후 `https://programming-learning.pages.dev` 형태의 URL에서 확인

### 방법 B — Wrangler CLI

```bash
npm install
npx wrangler login
npm run deploy
```

### 커스텀 도메인 연결

1. Pages 프로젝트 → **Custom domains** → **Set up a custom domain**
2. Cloudflare에 등록된 도메인 입력 (예: `learn.example.com`)
3. DNS가 Cloudflare를 통해 관리되면 자동으로 CNAME 설정됨
4. `sitemap.xml`의 `YOUR-DOMAIN.example`을 실제 도메인으로 수정 후 재배포

---

## Cloudflare 설정 파일

| 파일 | 역할 |
|------|------|
| `wrangler.toml` | Pages 프로젝트명 및 출력 디렉터리 |
| `_headers` | 보안 헤더, 정적 파일 캐시 |
| `_redirects` | 없는 경로 → `index.html` (SPA 라우팅) |
| `404.html` | 커스텀 404 페이지 |
| `robots.txt` | 검색 엔진 크롤링 허용 |

---

## 프로젝트 구조

```
├── index.html          # 메인 페이지
├── 404.html            # Cloudflare Pages 404
├── wrangler.toml       # Cloudflare Pages 설정
├── _headers            # HTTP 헤더
├── _redirects          # URL 리다이렉트
├── css/styles.css
├── js/
│   ├── problems.js     # 20개 문제 데이터
│   ├── transpiler.js   # C# → JS 변환
│   ├── runner.js       # 가상 콘솔 실행/채점
│   └── app.js          # UI 및 에디터
└── assets/favicon.svg
```

## 단축키

- **F5** — 코드 컴파일 및 검증
- **Tab** — 4칸 들여쓰기

## 참고

실제 C# 컴파일러가 아닌 브라우저용 간이 에뮬레이터입니다. Visual Studio / dotnet CLI와 결과가 다를 수 있습니다.
