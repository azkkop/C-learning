const PROBLEMS = [
            {
                id: 0,
                num: "STAGE 01",
                title: "로그인 시도 제한 시스템",
                desc: "사용자에게 아이디와 패스워드를 연달아 입력받는 가상 계정 검증기를 제작합니다.\n\n사용자 ID는 항상 \"Taeun\"이어야 하며, 패스워드는 \"dwpw\"입니다. 만약 하나라도 틀릴 경우 \"로그인 실패\"를 출력하고, 기회는 최대 3회 주어집니다. 3회 내에 일치하면 즉시 \"로그인 성공\"을 출력한 뒤 프로그램을 종료하고, 3회 모두 실패하면 \"계정 잠금\"을 출력해야 합니다.",
                methodName: "Main",
                signature: "public static void Main(string[] args)",
                params: [
                    "<code>Console.ReadLine()</code> ➔ 첫 번째 값은 ID, 두 번째 값은 비밀번호로 할당",
                    "로그인 실패 시 최대 3번까지 루프를 통해 재입력을 받아야 합니다."
                ],
                rules: "<strong>필수 조건:</strong><br>성공 시 정확히 <code>\"로그인 성공\"</code> 출력 후 즉시 종료.<br>3회 실패 시 정확히 <code>\"계정 잠금\"</code> 메시지를 출력하세요.",
                boilerplate: `using System;\n\npublic class Program\n{\n    public static void Main(string[] args)\n    {\n        // 여기에 콘솔 입출력을 활용한 코드를 작성하세요\n        \n    }\n}`,
                testcases: [
                    { inputs: ["Taeun", "dwpw"], expected: ["로그인 성공"], display: "ID: Taeun, PW: dwpw (1회차 성공)" },
                    { inputs: ["Taeun", "wrong", "Taeun", "dwpw"], expected: ["로그인 성공"], display: "ID: Taeun, PW: wrong ➔ 재입력 성공" },
                    { inputs: ["Taeun", "wrong1", "Taeun", "wrong2", "Taeun", "wrong3"], expected: ["계정 잠금"], display: "3회 불일치 ➔ 계정 잠금" }
                ]
            },
            {
                id: 1,
                num: "STAGE 02",
                title: "턴제 미니 보스 레이드",
                desc: "체력이 100인 보스를 상대로 플레이어가 실시간 데미지 값을 입력하여 처치하는 시뮬레이션을 작성합니다.\n\n매 턴마다 콘솔로 공격력 값을 입력받아 보스의 HP를 감산합니다. 매 타격 후 보스의 남은 HP를 출력해야 하며, 보스 HP가 0 이하로 떨어지는 순간 반복문을 탈출하고 \"보스 격파 완료!\"를 출력해야 합니다.",
                methodName: "Main",
                signature: "public static void Main(string[] args)",
                params: [
                    "보스 초기 HP = 100",
                    "<code>Console.ReadLine()</code> ➔ 매 턴 가하는 공격력 수치(int)"
                ],
                rules: "<strong>출력 명세:</strong><br>매 타격 시 <code>\"남은 HP: [수치]\"</code>를 출력하세요. (남은 HP가 음수가 되더라도 최소값인 0으로 보정하지 않고 실제 남은 음수값을 출력하거나 0으로 보정해도 무방하나, 마지막 라인에는 반드시 <code>\"보스 격파 완료!\"</code>가 찍혀야 합니다.)",
                boilerplate: `using System;\n\npublic class Program\n{\n    public static void Main(string[] args)\n    {\n        \n    }\n}`,
                testcases: [
                    { inputs: ["40", "30", "35"], expected: ["남은 HP: 60", "남은 HP: 30", "보스 격파 완료!"], display: "공격력: 40 ➔ 30 ➔ 35 (격파 완료)" },
                    { inputs: ["100"], expected: ["남은 HP: 0", "보스 격파 완료!"], display: "원턴킬 격파" }
                ]
            },
            {
                id: 2,
                num: "STAGE 03",
                title: "연속 성적 수합 처리기",
                desc: "동적으로 정수 N을 첫 라인에 입력받고, 이어서 N개의 시험 점수를 순차적으로 입력받는 평균 점수 분석기입니다.\n\nN개의 점수가 전부 입력 완료되면, 모든 점수의 총합과 평균(실수형 float 또는 double)을 구해 출력해야 합니다.",
                methodName: "Main",
                signature: "public static void Main(string[] args)",
                params: [
                    "첫 번째 입력: 점수 개수 N (int)",
                    "이후 N회 만큼 점수(int)를 입력받아 누적 연산"
                ],
                rules: "<strong>출력 명세:</strong><br>최종적으로 <code>\"총합: [값]\"</code>과 <code>\"평균: [평균값]\"</code> 형식으로 출력하세요. (평균은 정수 캐스팅 하지 않고 소수점 포함 출력)",
                boilerplate: `using System;\n\npublic class Program\n{\n    public static void Main(string[] args)\n    {\n        \n    }\n}`,
                testcases: [
                    { inputs: ["3", "80", "90", "100"], expected: ["총합: 270", "평균: 90"], display: "N=3, 점수 [80, 90, 100]" },
                    { inputs: ["2", "75", "80"], expected: ["총합: 155", "평균: 77.5"], display: "N=2, 점수 [75, 80]" }
                ]
            },
            {
                id: 3,
                num: "STAGE 04",
                title: "강화석 점진 소모 및 성공 시뮬레이터",
                desc: "장비 강화 시도 시 소모되는 재료가 기하급수적으로 늘어나는 통제 로직입니다.\n\n첫 줄에 보유 중인 강화석 개수(stone)를 입력받습니다. 초기 강화 단계는 1단계입니다.\n매 시도마다 `현재 단계`와 동일한 개수의 강화석이 소모됩니다. 사용자가 콘솔로 `1`을 입력하면 강화를 시도하며, 소모 연산 후 성공하여 강화 단계가 1 올라갑니다. 강화석이 현재 단계보다 부족해지면 시도를 거부하고 \"강화석 부족\"과 최종 도달한 단계를 출력하고 안전 종료해야 합니다.",
                methodName: "Main",
                signature: "public static void Main(string[] args)",
                params: [
                    "첫 줄 입력: 초기 소지 강화석 개수 (int)",
                    "이후 반복 입력: 시도 커맨드 `1` (그 외 숫자 입력 시 무시)"
                ],
                rules: "<strong>출력 명세:</strong><br>성공할 때마다 <code>\"[단계]단계 강화 성공\"</code> 출력.<br>강화석 부족 시 <code>\"강화석 부족. 최종단계: [단계]\"</code> 형식으로 안전하게 끝맺음 하세요.",
                boilerplate: `using System;\n\npublic class Program\n{\n    public static void Main(string[] args)\n    {\n        \n    }\n}`,
                testcases: [
                    { inputs: ["10", "1", "1", "1", "1"], expected: ["1단계 강화 성공", "2단계 강화 성공", "3단계 강화 성공", "강화석 부족"], display: "강화석 10개로 순차 소모 시도" }
                ]
            },
            {
                id: 4,
                num: "STAGE 05",
                title: "상점 장바구니 정산기",
                desc: "현재 소지한 골드를 입력받고 상점 이용 루프에 진입합니다.\n\n사용자는 반복하여 아이템 번호(1: 대검-50G, 2: 방패-30G, 0: 종료)를 입력합니다. 구매에 성공하면 소지 골드에서 차감하고 남은 잔액을 출력해야 합니다. 소지 골드가 부족한 물건을 선택하면 \"골드 부족\"을 출력해야 합니다. `0`이 입력되면 루프를 안전하게 종료하고 최종 정산 메시지를 보여줍니다.",
                methodName: "Main",
                signature: "public static void Main(string[] args)",
                params: [
                    "첫 줄 입력: 소지 골드(int)",
                    "이후 반복 입력: 상품 선택 코드(1, 2, 또는 0)"
                ],
                rules: "구매 완료 시 <code>\"남은 골드: [금액]\"</code> 출력.<br>골드 부족 시 <code>\"골드 부족\"</code> 출력.<br>종료 시 <code>\"상점 종료. 최종 잔액: [금액]\"</code>을 출력하세요.",
                boilerplate: `using System;\n\npublic class Program\n{\n    public static void Main(string[] args)\n    {\n        \n    }\n}`,
                testcases: [
                    { inputs: ["100", "1", "2", "1", "0"], expected: ["남은 골드: 50", "남은 골드: 20", "골드 부족", "최종 잔액: 20"], display: "100골드로 대검 ➔ 방패 ➔ 대검(실패) ➔ 종료" }
                ]
            },
            {
                id: 5,
                num: "STAGE 06",
                title: "사용자 커스텀 범위 구구단",
                desc: "시작 단수와 끝 단수를 차례로 입력받아 다차원 곱셈표를 출력하는 프로그램입니다.\n\n중첩 반복문(`for`) 구조를 사용하여 시작단부터 끝단까지의 곱셈식을 순차적으로 정렬 렌더링해야 합니다.",
                methodName: "Main",
                signature: "public static void Main(string[] args)",
                params: [
                    "첫 번째 입력: 시작 단(int)",
                    "두 번째 입력: 끝 단(int)"
                ],
                rules: "수식 출력 포맷: <code>\"[단] x [곱하는수] = [결과]\"</code> 형식으로 출력하세요.",
                boilerplate: `using System;\n\npublic class Program\n{\n    public static void Main(string[] args)\n    {\n        \n    }\n}`,
                testcases: [
                    { inputs: ["3", "4"], expected: ["3 x 1 = 3", "3 x 9 = 27", "4 x 1 = 4", "4 x 9 = 36"], display: "3단부터 4단까지 출력" }
                ]
            },
            {
                id: 6,
                num: "STAGE 07",
                title: "비밀번호 실패 카운터와 유동 힌트",
                desc: "올바른 시스템 암호 \"dwpw\"를 맞히는 인터랙티브 도어락입니다.\n\n사용자에게 입력을 요청하며, 틀릴 경우 틀린 횟수(최대 3회)에 따라 점진적인 문자 힌트를 제공합니다.\n- 1회 실패 시 힌트: `첫 글자는 d`\n- 2회 실패 시 힌트: `두 번째 글자는 w`\n- 3회 실패 시: \"시스템 경보 발동\"을 출력하고 종료합니다.",
                methodName: "Main",
                signature: "public static void Main(string[] args)",
                params: [
                    "암호 정답: dwpw",
                    "<code>Console.ReadLine()</code> ➔ 매 시도 입력 문자열"
                ],
                rules: "일치 시 즉시 <code>\"접속 승인\"</code> 출력 후 정상 종료.<br>3회 실패 시 <code>\"시스템 경보 발동\"</code>을 출력해야 합니다.",
                boilerplate: `using System;\n\npublic class Program\n{\n    public static void Main(string[] args)\n    {\n        \n    }\n}`,
                testcases: [
                    { inputs: ["wrong1", "wrong2", "dwpw"], expected: ["첫 글자는 d", "두 번째 글자는 w", "접속 승인"], display: "2회 실패 후 3회차 성공" },
                    { inputs: ["abc", "def", "ghi"], expected: ["첫 글자는 d", "두 번째 글자는 w", "시스템 경보 발동"], display: "3회 최종 실패" }
                ]
            },
            {
                id: 7,
                num: "STAGE 08",
                title: "2차원 평면 탐색 좌표계",
                desc: "초기 위치 (0, 0)에서 시작해 사용자의 이동 명령에 반응하는 탐색 알고리즘을 만듭니다.\n\n방향 지시자(W: 위 Y축 +1, S: 아래 Y축 -1, A: 왼쪽 X축 -1, D: 오른쪽 X축 +1)를 입력받을 때마다 좌표를 실시간 가산하고 현재 위치를 출력합니다. 'Q' 혹은 'q'를 입력하면 \"탐색 종료\"와 최종 위치를 찍고 종료합니다.",
                methodName: "Main",
                signature: "public static void Main(string[] args)",
                params: [
                    "매 루프 방향값(string) 입력"
                ],
                rules: "매 이동 완료 시 <code>\"현재 위치: ([X], [Y])\"</code> 포맷으로 정확히 출력할 것.<br>종료 명령 시 <code>\"탐색 종료. 최종 좌표: ([X], [Y])\"</code>를 출력하세요.",
                boilerplate: `using System;\n\npublic class Program\n{\n    public static void Main(string[] args)\n    {\n        \n    }\n}`,
                testcases: [
                    { inputs: ["W", "D", "D", "S", "Q"], expected: ["(0, 1)", "(1, 1)", "(2, 1)", "(2, 0)", "탐색 종료. 최종 좌표: (2, 0)"], display: "상 ➔ 우 ➔ 우 ➔ 하 탐색 시퀀스" }
                ]
            },
            {
                id: 8,
                num: "STAGE 09",
                title: "동적 마나 소모 및 연속 콤보 연산",
                desc: "마나 통 100을 기본 보관한 상태에서 액션 콤보를 누적시키는 루프 계산기를 작성합니다.\n\n사용자에게 메뉴를 입력받습니다 (1: 파이어볼-소모 마나 25, 2: 마나 회복-충전 마나 35, 0: 콤보 종료).\n- 파이어볼 시전 시 마나가 충분하면 마나를 빼고 \"콤보 성공\"과 남은 마나를 출력합니다.\n- 마나가 부족하면 \"스킬 시전 불가\"를 출력하고 마나량을 유지합니다.\n- `0`이 입력되면 누적 시전 성공한 총 파이어볼 횟수를 최종 출력합니다.",
                methodName: "Main",
                signature: "public static void Main(string[] args)",
                params: [
                    "초기 마나 = 100",
                    "메뉴 번호(int) 연속 입력"
                ],
                rules: "스킬 성공: <code>\"콤보 성공. 남은 마나: [마나]\"</code><br>실패: <code>\"스킬 시전 불가\"</code><br>종료: <code>\"총 콤보 횟수: [횟수]\"</code>를 출력하세요.",
                boilerplate: `using System;\n\npublic class Program\n{\n    public static void Main(string[] args)\n    {\n        \n    }\n}`,
                testcases: [
                    { inputs: ["1", "1", "1", "1", "2", "1", "0"], expected: ["콤보 성공. 남은 마나: 75", "콤보 성공. 남은 마나: 50", "콤보 성공. 남은 마나: 25", "콤보 성공. 남은 마나: 0", "콤보 성공. 남은 마나: 10", "총 콤보 횟수: 5"], display: "연속 파이어볼 시전 및 회복 정합 테스트" }
                ]
            },
            {
                id: 9,
                num: "STAGE 10",
                title: "역삼각형 피라미드 빌더",
                desc: "중첩 반복문(`for`)의 인덱스 감소 방향 역학을 테스트하기 위한 역별 찍기 프로그램입니다.\n\n정수 N을 입력받은 후, 첫 줄에 N개, 마지막 줄에 1개가 출력되는 역방향 직각삼각형을 그립니다.",
                methodName: "Main",
                signature: "public static void Main(string[] args)",
                params: [
                    "첫 줄 입력: 삼각형의 높이 N (int)"
                ],
                rules: "줄바꿈 규칙을 엄수하여 <code>*</code> 문자로 이루어진 역삼각형을 완벽히 묘사하세요.",
                boilerplate: `using System;\n\npublic class Program\n{\n    public static void Main(string[] args)\n    {\n        \n    }\n}`,
                testcases: [
                    { inputs: ["4"], expected: ["****", "***", "**", "*"], display: "높이 N=4 역삼각형" }
                ]
            },
            {
                id: 10,
                num: "STAGE 11",
                title: "동적 몬스터 등급 카운터",
                desc: "다수의 데이터를 배열에 할당한 후 원하는 특정 타겟 구간의 데이터 조건 검사 수합 능력을 테스트합니다.\n\n먼저 출현시킬 총 몬스터 마리 수 N을 입력받습니다. 이어서 N번에 걸쳐 출현한 몬스터들의 등급 점수(0~100)를 연속해서 입력받아 배열에 저장합니다.\n입력이 모두 완료되면, 해당 배열을 루프 순회하여 정수 80 이상을 기록한 고위험 엘리트 등급 몬스터가 몇 마리인지 집계하여 반환합니다.",
                methodName: "Main",
                signature: "public static void Main(string[] args)",
                params: [
                    "첫 번째 입력: N (몬스터 수)",
                    "이후 N회에 걸쳐 정수 점수 입력받아 저장"
                ],
                rules: "<strong>출력 명세:</strong><br>최종 연산이 끝나면 정확하게 <code>\"엘리트 몬스터: [마리수]마리\"</code> 형식으로 출력하세요.",
                boilerplate: `using System;\n\npublic class Program\n{\n    public static void Main(string[] args)\n    {\n        \n    }\n}`,
                testcases: [
                    { inputs: ["4", "45", "85", "90", "20"], expected: ["엘리트 몬스터: 2마리"], display: "4마리 점수 입력 후 판정" }
                ]
            },
            {
                id: 11,
                num: "STAGE 12",
                title: "인벤토리 인덱스 스왑 연산 가드",
                desc: "인덱스 변조 위협에 안전한 배열 내부 스왑 가드를 구성합니다.\n\n초기 인벤토리 배열은 `int[] inv = new int[4] { 10, 20, 30, 40 };`로 정의되어 있습니다.\n사용자에게 교체할 두 방의 인덱스 번호 A와 B를 입력받습니다. 인덱스가 배열 크기 범위(0~3) 안에 안전하게 있다면 두 위치의 아이템 수량을 교체하고 \"스왑 성공\"과 변경된 배열 상태를 보여주고, 범위를 벗어난 인덱스가 오면 에러 없이 \"잘못된 인덱스\"를 출력하고 재입력을 받도록 루프화합니다. `-1`이 입력되면 안전 종료합니다.",
                methodName: "Main",
                signature: "public static void Main(string[] args)",
                params: [
                    "기본 정수 배열: { 10, 20, 30, 40 }",
                    "스왑 대상 인덱스 A, B 순차 입력 및 -1 입력으로 종료"
                ],
                rules: "성공: <code>\"스왑 완료\"</code> 및 현재 바뀐 전체 배열 성분 출력.<br>실패: 범위 초과 시 <code>\"잘못된 인덱스\"</code>를 출력하세요.",
                boilerplate: `using System;\n\npublic class Program\n{\n    public static void Main(string[] args)\n    {\n        \n    }\n}`,
                testcases: [
                    { inputs: ["1", "3", "5", "0", "-1"], expected: ["스왑 완료", "잘못된 인덱스"], display: "정상 범위 스왑 후 아웃바운드 인덱스 예외 차단 검사" }
                ]
            },
            {
                id: 12,
                num: "STAGE 13",
                title: "파티원 분배 예외 재귀 루프",
                desc: "나눗셈 분모가 0이 되어 프로그램이 터지는 크래시 상황을 사용자 조건문 반복 구조로 안전하게 제어합니다.\n\n첫 줄에 획득한 총 골드 정수 수치(gold)를 입력받습니다. 두 번째 줄에는 분배할 파티 멤버 수(member)를 입력받습니다.\n만약 파티 멤버 수가 `0` 이하의 숫자로 유입된다면, 강제로 \"분배 불가능. 다시 입력\"을 출력하고 정상적인 1개 이상의 멤버 수가 들어올 때까지 루프를 통해 파티원 수를 계속 재입력받아야 합니다.",
                methodName: "Main",
                signature: "public static void Main(string[] args)",
                params: [
                    "첫 번째 입력: 보상 골드 (int)",
                    "두 번째 입력: 파티원 수 (0 이하 입력 시 무한 재질문)"
                ],
                rules: "정상 분배 완료 시 <code>\"인당 분배 골드: [몫]\"</code>과 <code>\"남은 골드: [나머지]\"</code> 형식을 만족하세요.",
                boilerplate: `using System;\n\npublic class Program\n{\n    public static void Main(string[] args)\n    {\n        \n    }\n}`,
                testcases: [
                    { inputs: ["100", "0", "-3", "4"], expected: ["분배 불가능. 다시 입력", "인당 분배 골드: 25"], display: "0명, 음수명 필터링 후 4명으로 정상 분배 완료" }
                ]
            },
            {
                id: 13,
                num: "STAGE 14",
                title: "스탯 주사위 유지 및 잠금",
                desc: "남은 재굴림 주사위 수량 한도 안에서 무작위 가상의 능력치를 선택 유지하는 게임 내부 스탯 기획 로직입니다.\n\n사용자는 3회의 주사위 재굴림 권한을 갖습니다. 매 루프마다 `1`을 누르면 기회를 1 차감하고 새로운 난수 스탯(기본 스탯 + 보너스 누적)을 획득합니다. `0`을 누르면 만족하여 루프를 조기 종료하고 스탯을 확정 락인합니다.",
                methodName: "Main",
                signature: "public static void Main(string[] args)",
                params: [
                    "초기 재굴림 횟수 = 3",
                    "선택 코드: 1(재굴림), 0(확정 및 종료)"
                ],
                rules: "재굴림 시 남은 기회를 <code>\"남은 기회: [횟수]\"</code>로 표기하고 0이 되면 자동으로 <code>\"주사위 전부 소진\"</code>과 최종 상태를 출력 후 종료해야 합니다.",
                boilerplate: `using System;\n\npublic class Program\n{\n    public static void Main(string[] args)\n    {\n        \n    }\n}`,
                testcases: [
                    { inputs: ["1", "1", "0"], expected: ["남은 기회: 2", "남은 기회: 1", "최종 확정"], display: "2회 재굴림 후 0으로 최종 조기 확정" }
                ]
            },
            {
                id: 14,
                num: "STAGE 15",
                title: "점진 도트 치유 시뮬레이터",
                desc: "매 라운드마다 축적 정합 가해지는 치유 가중 연산 로직입니다.\n\n초기 체력(hp)과 매 턴 기본 자가 회복 한계치(heal)를 입력받습니다. 총 5턴의 라운드가 루프로 자동 실행됩니다. 매 턴마다 적용되는 회복 능력은 `기본 heal + (현재 턴수 * 2)` 가중치가 더해집니다. 각 턴 실행 후 현재 체력 상태를 출력해야 합니다. (최대 체력의 한계는 200으로 설정하여 200을 초과하지 못하도록 가드 절을 구성하세요)",
                methodName: "Main",
                signature: "public static void Main(string[] args)",
                params: [
                    "첫 줄: 초기 hp (int)",
                    "두 번째 줄: 기본 회복량 heal (int)"
                ],
                rules: "매 턴 증가 결과를 <code>\"[턴]턴 HP: [hp수치]\"</code>로 정렬하여 5번 출력하고 최대 한도 200 가드를 확인하세요.",
                boilerplate: `using System;\n\npublic class Program\n{\n    public static void Main(string[] args)\n    {\n        \n    }\n}`,
                testcases: [
                    { inputs: ["50", "10"], expected: ["1턴 HP: 62", "2턴 HP: 76", "3턴 HP: 92", "4턴 HP: 110", "5턴 HP: 130"], display: "HP 50, 기본 회복 10으로 시작해 점진 누적" },
                    { inputs: ["190", "10"], expected: ["1턴 HP: 200", "5턴 HP: 200"], display: "200 최대 체력 가드 한계치 차단 검증" }
                ]
            },
            {
                id: 15,
                num: "STAGE 16",
                title: "퀘스트 사냥 정량 달성기",
                desc: "사냥 목표 마리 수 100마리를 누적 완성해 나가는 동적 와일 루프 트래커입니다.\n\n프로그램 시작 시 목표 잔여 마리를 \"남은 마리: 100\"으로 출력하고, 루프를 돌며 웨이브마다 사냥에 성공한 몬스터 마리 수를 입력받습니다. 누적 합산하여 남은 필요 목표 마리를 계속 업데이트하여 보여주며, 최종 합산이 100을 채우는 순간 즉시 멈추고 \"퀘스트 성공!\"을 출력해야 합니다.",
                methodName: "Main",
                signature: "public static void Main(string[] args)",
                params: [
                    "매 루프 사냥한 몬스터 정수 값 입력"
                ],
                rules: "목표 잔여량 갱신 출력: <code>\"잔여 목표: [남은 마리수]/100\"</code> 형식 필수.<br>완수 완료 시 최종적으로 <code>\"퀘스트 성공!\"</code>이 명시되어야 합니다.",
                boilerplate: `using System;\n\npublic class Program\n{\n    public static void Main(string[] args)\n    {\n        \n    }\n}`,
                testcases: [
                    { inputs: ["40", "35", "30"], expected: ["잔여 목표: 60/100", "잔여 목표: 25/100", "퀘스트 성공!"], display: "3번의 웨이브 사냥으로 105마리 사냥 완수" }
                ]
            },
            {
                id: 16,
                num: "STAGE 17",
                title: "최단 거리 적 식별 업데이트",
                desc: "3개 구역의 적까지의 거리가 배열 `int[] enemyDist = new int[3] { 50, 80, 30 };`로 정의되어 시작합니다.\n\n사용자는 특정 구역 번호(0~2)와 해당 몬스터의 변동된 새로운 거리값을 차례로 콘솔에 입력합니다. 입력마다 배열 해당 구역 요소 수치를 갱신하고 현재 거리 배열 중 가장 가까운 거리(최소값)를 가지고 있는 적의 번호(인덱스)를 찾아 출력합니다. `-1`이 입력되면 루프를 최종 종료합니다.",
                methodName: "Main",
                signature: "public static void Main(string[] args)",
                params: [
                    "초기 배열: { 50, 80, 30 }",
                    "변경할 몬스터 인덱스, 변경할 새로운 거리값 연속 입력"
                ],
                rules: "매 업데이트 시 <code>\"가장 가까운 적: [인덱스]번\"</code> 형식으로 갱신 출력하고 예외 인덱스는 안전 처리하세요.",
                boilerplate: `using System;\n\npublic class Program\n{\n    public static void Main(string[] args)\n    {\n        \n    }\n}`,
                testcases: [
                    { inputs: ["0", "10", "2", "40", "-1"], expected: ["가장 가까운 적: 2번", "가장 가까운 적: 0번"], display: "0번 적 거리를 10으로 단축 ➔ 2번 적 거리를 40으로 증가 연산 추적" }
                ]
            },
            {
                id: 17,
                num: "STAGE 18",
                title: "아이템 레시피 정량 충족 가드",
                desc: "장비를 제작하기 위해 필요한 소모 재료(나무 3개, 철광석 2개)의 충족 여부를 판단하는 입력 대조 루프입니다.\n\n콘솔로 사용자가 현재 수집한 나무 개수와 철광석 개수를 순차적으로 입력합니다.\n- 재료가 단 하나라도 부족하다면 \"제작 불가. 재료 부족\"과 부족한 각각의 자원 수량을 알려주고 재수집 입력을 대기시킵니다.\n- 조건을 모두 완전히 충족하면 마침내 \"장비 제작 성공!\"을 출력한 뒤 루프를 탈출 완료합니다.",
                methodName: "Main",
                signature: "public static void Main(string[] args)",
                params: [
                    "요구 수량: 나무 3, 철광석 2",
                    "매 시도: 수집한 나무(int), 수집한 철광석(int) 순차 입력"
                ],
                rules: "조건 불충족 시: <code>\"제작 불가. 재료 부족\"</code> 출력.<br>충족 성공 시: <code>\"장비 제작 성공!\"</code>을 출력하세요.",
                boilerplate: `using System;\n\npublic class Program\n{\n    public static void Main(string[] args)\n    {\n        \n    }\n}`,
                testcases: [
                    { inputs: ["2", "1", "4", "3"], expected: ["제작 불가. 재료 부족", "장비 제작 성공!"], display: "나무 2, 철광 1 (실패) ➔ 나무 4, 철광 3 (성공)" }
                ]
            },
            {
                id: 18,
                num: "STAGE 19",
                title: "피보나치 수열 버프 가산 연산",
                desc: "콤보 횟수 N을 입력받아 피보나치 수열 규칙에 근거한 특수 누적 버프량 전개식을 동적으로 정합하는 로직을 생성합니다.\n\n정수 N(N은 최소 1 이상)을 입력받아, 1항과 2항은 항상 1이며 그 뒤 항은 이전 두 항의 합이 되는 피보나치 수열을 총 N개 계산하여 쉼표로 연결 출력 형식에 맞춰 일렬로 나열해야 합니다.",
                methodName: "Main",
                signature: "public static void Main(string[] args)",
                params: [
                    "첫 줄 입력: 출력할 수열의 크기 N (int)"
                ],
                rules: "<strong>출력 포맷:</strong><br>수열 성분들을 쉼표로 분할하여 가로로 나열해 출력하세요. 예: N=5 일 때 <code>\"1, 1, 2, 3, 5\"</code>",
                boilerplate: `using System;\n\npublic class Program\n{\n    public static void Main(string[] args)\n    {\n        \n    }\n}`,
                testcases: [
                    { inputs: ["5"], expected: ["1, 1, 2, 3, 5"], display: "피보나치 5개 항목 연산" },
                    { inputs: ["2"], expected: ["1, 1"], display: "피보나치 2개 항목 연산" }
                ]
            },
            {
                id: 19,
                num: "STAGE 20",
                title: "던전 갈림길 미로 서바이벌",
                desc: "플레이어가 던전 안 방 번호 1번에서 탐색을 시작합니다. 방 번호가 3번에 도달하면 안전 미로를 클리어하고 탈출에 최종 성공하는 어드벤처 구조를 짭니다.\n\n매 라운드마다 갈림길 문 선택지(1: 왼쪽 문-전진에 성공하여 방 번호 +1 증가 및 10골드 보너스 획득, 2: 오른쪽 문-함정이 발동하여 제자리 유지 및 5골드 벌금 패널티)를 입력받습니다.\n안전하게 3번 방에 발을 들여놓는 순간 반복문을 파괴하고 탈출 결과 문장과 획득한 총 누적 잔액 골드를 보여주며 종료되어야 합니다.",
                methodName: "Main",
                signature: "public static void Main(string[] args)",
                params: [
                    "시작 방 번호 = 1, 초기 골드 = 0",
                    "매 문 선택지 번호(int) 입력"
                ],
                rules: "방 전진 시: <code>\"방 전진 완료\"</code> 출력.<br>함정 발동 시: <code>\"함정 발동 패널티\"</code> 출력.<br>탈출 성공 시: <code>\"탈출 성공. 총 골드: [골드]G\"</code>를 출력하세요.",
                boilerplate: `using System;\n\npublic class Program\n{\n    public static void Main(string[] args)\n    {\n        \n    }\n}`,
                testcases: [
                    { inputs: ["1", "2", "1"], expected: ["방 전진 완료", "함정 발동 패널티", "탈출 성공. 총 골드: 15G"], display: "성공(방 2, 10G) ➔ 실패(방 2, 5G) ➔ 성공(방 3, 15G) ➔ 탈출" }
                ]
            }
        ];
