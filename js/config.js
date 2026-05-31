const SITE_CONFIG = {
    name: 'CodeExam Lab',
    title: '프로그래밍 시험 대비 플랫폼',
    tagline: 'C# 콘솔 프로그래밍 · 실시간 자동 채점 · 오프라인 연습 지원',
    description: 'C# 콘솔 입출력 20스테이지 연습 및 자동 채점. 중간·기말·자격 시험 대비 프로그래밍 실습 플랫폼.',
    version: '2.0.0',
    storageKeys: {
        solved: 'codexam_v2_solved',
        codes: 'codexam_v2_codes'
    },
    legacyKeys: {
        solved: 'taeun_solved_pro',
        codes: 'taeun_saved_codes_pro'
    },
    courses: [
        {
            id: 'csharp-console',
            name: 'C# 콘솔 프로그래밍',
            language: 'C#',
            stageCount: 20,
            active: true
        }
    ]
};
