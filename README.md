# CodeExam Lab

**프로그래밍 시험 대비 플랫폼** — C# 콘솔 프로그래밍을 브라우저에서 연습하고 자동 채점합니다.  
중간·기말·자격 시험 등 **반복 실습**을 위한 정적 웹 앱이며, Cloudflare Pages 배포에 최적화되어 있습니다.

## 주요 기능

- 20개 C# 콘솔 스테이지 (반복문, 조건문, 배열, 입출력)
- 가상 콘솔 에뮬레이터 + 자동 테스트
- CodeMirror 코드 에디터 (구문 강조, F5 실행)
- C# `$"..."` · `foreach` · `switch` · `Random` 지원
- 진행률 localStorage 저장 + JSON 백업/복원
- PWA 오프라인 캐시
- URL 스테이지 공유 (`?stage=3`)
- 스테이지별 힌트

## 로컬 실행

```bash
python -m http.server 8080
# 또는
npm install && npm run preview
```

## Cloudflare Pages 배포

| 항목 | 값 |
|------|-----|
| Framework preset | None |
| Build command | *(비움)* |
| Build output directory | `.` |

GitHub 저장소 연동 후 자동 배포됩니다.

## 프로젝트 구조

```
├── index.html
├── manifest.json / sw.js   # PWA
├── wrangler.toml           # Cloudflare
├── js/
│   ├── config.js           # 사이트·과정 설정
│   ├── problems.js         # 20개 문제
│   ├── hints.js            # 스테이지 힌트
│   ├── transpiler.js       # C# → JS
│   ├── runner.js           # 실행·채점
│   ├── editor.js           # CodeMirror
│   ├── storage.js          # 백업/복원
│   └── app.js              # UI
└── css/styles.css
```

## 확장 계획

`js/config.js`의 `courses` 배열에 새 과정을 추가하면, 향후 JavaScript·Python 등 **다른 시험 대비 코스**를 같은 플랫폼에 탑재할 수 있습니다.

## 단축키

- **F5** — 실행 및 채점
- **Tab** — 4칸 들여쓰기
- **Ctrl+/** — 주석 토글

## 참고

브라우저용 C# **에뮬레이터**입니다. Visual Studio / dotnet CLI와 100% 동일하지 않을 수 있습니다.
