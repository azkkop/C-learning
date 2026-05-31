# C# 터미널 게임 프로그래밍 학습

브라우저에서 C# 콘솔 프로그래밍을 연습하고 자동 채점하는 정적 웹 학습 사이트입니다.

## 기능

- 20개 스테이지 (반복문, 조건문, 배열, 입출력)
- 가상 콘솔 에뮬레이터 + 자동 테스트
- 코드 자동 저장 (localStorage)
- 진행률 추적
- URL 스테이지 공유 (`?stage=3`)
- 모바일 탭 UI (문제 / 코드 / 결과)

## 로컬 실행

별도 빌드 없이 정적 파일을 열면 됩니다.

```bash
# Python 내장 서버 예시
python -m http.server 8080
```

브라우저에서 `http://localhost:8080` 접속

## GitHub Pages 배포

1. Repository Settings → Pages
2. Source: `Deploy from a branch`
3. Branch: `main` / `/ (root)`
4. 저장 후 `https://azkkop.github.io/programming-learning/` 에서 접속

## 프로젝트 구조

```
├── index.html          # 메인 페이지
├── css/styles.css      # 커스텀 스타일
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
