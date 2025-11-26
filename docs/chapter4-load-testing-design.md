# 4. 부하 테스트 설계 및 준비

## 4.1 부하 테스트 목적 및 범위

### 4.1.1 테스트 목표 정의

본 프로젝트의 부하 테스트는 GCP(Google Cloud Platform) 기반으로 구축된 축구 티켓팅 시스템의 확장성, 안정성, 성능을 검증하기 위해 설계되었다. 구체적인 테스트 목표는 다음과 같다.

#### 주요 목표 (Primary Objectives)

**1. 오토스케일링 동작 검증**

GCP Managed Instance Group의 자동 확장 및 축소 기능이 설정된 임계값에 따라 정상적으로 작동하는지 검증한다. 이는 실제 트래픽 급증 상황에서 시스템이 자동으로 대응할 수 있는 능력을 평가하는 핵심 지표이다.

- 확장 조건: CPU 사용률 10% 초과 시
- 확장 범위: 최소 2개에서 최대 5개 인스턴스
- 확장 속도: 목표 5분 이내
- 축소 속도: 목표 20분 이내

**2. 로드밸런서 트래픽 분산 확인**

HTTP(S) 로드밸런서가 여러 백엔드 인스턴스에 트래픽을 균등하게 분산하는지 확인한다. 이를 통해 단일 인스턴스 과부하를 방지하고 전체 시스템의 처리 용량을 최대화할 수 있다.

- 분산 알고리즘: 라운드 로빈 기반
- 헬스 체크: 10초 간격, /health 엔드포인트
- 세션 어피니티: 비활성화 (스테이트리스 설계)

**3. 시스템 안정성 및 성능 측정**

높은 부하 상황에서도 시스템이 안정적으로 작동하며, 허용 가능한 응답 시간을 유지하는지 측정한다.

- 목표 응답 시간: 평균 500ms 이하
- 목표 에러율: 5% 이하
- 목표 가용성: 99% 이상
- 동시 처리 용량: 초당 500 요청 (RPS)

**4. 병목 지점 식별**

시스템의 성능 한계와 병목 지점을 파악하여 향후 최적화 방향을 제시한다.

- 애플리케이션 레벨: Node.js 프로세스 성능
- 데이터베이스 레벨: Cloud SQL 쿼리 성능
- 네트워크 레벨: 대역폭 및 지연 시간
- 인프라 레벨: 인스턴스 리소스 사용률

#### 부차적 목표 (Secondary Objectives)

**1. 비용 효율성 평가**

오토스케일링을 통한 동적 리소스 할당이 고정 용량 대비 얼마나 비용 효율적인지 평가한다.

**2. 모니터링 시스템 검증**

실시간 모니터링 위젯과 GCP Console 모니터링이 정확하게 작동하는지 확인한다.

**3. 장애 복구 능력 평가**

인스턴스 장애 발생 시 로드밸런서의 헬스 체크와 트래픽 재분배가 정상적으로 작동하는지 확인한다.

---

### 4.1.2 테스트 시나리오 설계

실제 티켓팅 서비스의 사용자 행동 패턴을 반영한 3가지 시나리오를 설계하였다. 각 시나리오는 서로 다른 페이지와 기능에 초점을 맞추어 시스템의 다양한 측면을 테스트한다.

#### 시나리오 1: 로그인 페이지 - 대량 회원가입 및 로그인

**배경 (Context)**

인기 경기 티켓 오픈 직전, 수많은 사용자가 동시에 웹사이트에 접속하여 회원가입하거나 로그인을 시도하는 상황을 시뮬레이션한다. 이는 티켓팅 서비스에서 가장 높은 부하가 발생하는 시점이다.

**시나리오 상세**

```
사용자 행동 플로우:
1. 웹사이트 접속 (로그인 페이지)
2. 회원가입 (50%) 또는 로그인 시도 (50%)
3. 인증 처리 및 세션 생성
```

**기술적 특성**

- **데이터베이스 부하**: 높음
  - 회원가입: INSERT 쿼리 (users 테이블)
  - 로그인: SELECT 쿼리 + 비밀번호 검증
- **CPU 사용률**: 높음 (암호화 처리, JWT 생성)
- **메모리 사용률**: 중간 (세션 데이터)
- **네트워크 트래픽**: 낮음 (작은 페이로드)

**예상 부하 특성**

- 초당 요청 수: 250개 (회원가입 125개 + 로그인 125개)
- 평균 응답 시간: 200-300ms
- 데이터베이스 연결 수: 증가
- CPU 사용률: 급격히 상승

**측정 지표**

- 회원가입 성공률
- 로그인 성공률
- 평균 응답 시간
- 데이터베이스 쿼리 실행 시간
- JWT 생성 시간

#### 시나리오 2: 메인 페이지 - 경기 조회 및 예매 내역

**배경 (Context)**

로그인한 사용자들이 예매 가능한 경기 목록을 조회하고, 자신의 예매 내역을 확인하는 상황을 시뮬레이션한다. 이는 지속적으로 발생하는 일반적인 사용자 행동 패턴이다.

**시나리오 상세**

```
사용자 행동 플로우:
1. 메인 페이지 접속 (로그인 상태)
2. 경기 목록 조회 (60%)
3. 내 예매 내역 조회 (40%)
4. 실시간 좌석 현황 확인
```

**기술적 특성**

- **데이터베이스 부하**: 중간-높음
  - 경기 조회: SELECT 쿼리 (matches 테이블)
  - 예매 내역: JOIN 쿼리 (bookings + matches + users)
- **CPU 사용률**: 중간 (데이터 처리 및 JSON 변환)
- **메모리 사용률**: 중간 (쿼리 결과 캐싱)
- **네트워크 트래픽**: 중간 (JSON 데이터 전송)

**예상 부하 특성**

- 초당 요청 수: 300개 (경기 조회 180개 + 예매 내역 120개)
- 평균 응답 시간: 150-250ms
- 데이터베이스 쿼리 복잡도: 중간-높음 (JOIN 포함)
- 캐시 히트율: 측정 대상

**측정 지표**

- 경기 목록 조회 응답 시간
- 예매 내역 조회 응답 시간 (JOIN 쿼리)
- 데이터베이스 연결 풀 사용률
- 캐시 효율성 (구현 시)

#### 시나리오 3: 티켓 예매 모달 - 좌석 조회 및 예매 시도

**배경 (Context)**

사용자가 특정 경기를 선택하여 좌석 선택 화면에 진입하고, 실시간으로 예매 가능한 좌석을 조회하는 상황을 시뮬레이션한다.

**시나리오 상세**

```
사용자 행동 플로우:
1. 경기 선택 및 좌석 선택 모달 오픈
2. 예매된 좌석 조회 (70%)
3. 경기 상세 정보 조회 (30%)
4. 실시간 좌석 현황 업데이트
```

**기술적 특성**

- **데이터베이스 부하**: 중간
  - 좌석 조회: SELECT 쿼리 (bookings 테이블)
  - 경기 정보: SELECT 쿼리 (matches 테이블)
- **CPU 사용률**: 낮음-중간
- **메모리 사용률**: 낮음
- **네트워크 트래픽**: 낮음 (작은 데이터셋)

**예상 부하 특성**

- 초당 요청 수: 350개 (좌석 조회 245개 + 경기 정보 105개)
- 평균 응답 시간: 100-200ms
- 동시성 제어: 중요 (좌석 중복 예매 방지)
- 실시간성: 높음 (최신 좌석 정보 필요)

**측정 지표**

- 좌석 조회 응답 시간
- 데이터 일관성 (동시성 제어)
- 실시간 업데이트 정확도

#### 시나리오 통합 전략

실제 부하 테스트에서는 현재 사용자가 위치한 페이지에 따라 자동으로 적절한 시나리오가 선택되도록 구현하였다.

```javascript
// 컨텍스트 기반 시나리오 선택
if (!isLoggedIn) {
  // 시나리오 1: 로그인 페이지
  executeAuthScenario();
} else if (isModalOpen) {
  // 시나리오 3: 티켓 예매 모달
  executeBookingScenario();
} else {
  // 시나리오 2: 메인 페이지
  executeMainPageScenario();
}
```

이러한 컨텍스트 인식 방식은 실제 사용자 경험을 더욱 정확하게 반영하며, 각 페이지별 성능 특성을 독립적으로 평가할 수 있게 한다.

---

### 4.1.3 성공 기준 정의 (Success Criteria)

부하 테스트의 성공 여부를 객관적으로 판단하기 위해 정량적 및 정성적 기준을 다음과 같이 정의하였다.

#### 정량적 기준 (Quantitative Criteria)

**1. 오토스케일링 성능**

| 지표              | 목표값                   | 측정 방법              |
| ----------------- | ------------------------ | ---------------------- |
| 확장 시작 시간    | CPU 10% 초과 후 1분 이내 | GCP Console 타임스탬프 |
| 첫 번째 확장 완료 | 부하 시작 후 3분 이내    | 인스턴스 그룹 멤버 탭  |
| 최대 확장 완료    | 부하 시작 후 10분 이내   | 인스턴스 개수 5개 도달 |
| 축소 시작 시간    | 부하 중지 후 5분 이내    | CPU 사용률 감소 확인   |
| 최소 축소 완료    | 부하 중지 후 20분 이내   | 인스턴스 개수 2개 도달 |

**2. 시스템 성능**

| 지표           | 목표값   | 허용 범위 | 측정 방법           |
| -------------- | -------- | --------- | ------------------- |
| 평균 응답 시간 | < 500ms  | < 1000ms  | 로드밸런서 모니터링 |
| P95 응답 시간  | < 1000ms | < 2000ms  | 백엔드 지연 시간    |
| P99 응답 시간  | < 2000ms | < 3000ms  | 상세 로그 분석      |
| 처리량 (RPS)   | > 400    | > 300     | 로드밸런서 요청 수  |
| 에러율         | < 5%     | < 10%     | 성공/실패 비율      |

**3. 리소스 사용률**

| 지표              | 목표값 | 임계값  | 측정 방법          |
| ----------------- | ------ | ------- | ------------------ |
| CPU 사용률 (평균) | 40-60% | < 80%   | GCP 모니터링       |
| 메모리 사용률     | < 70%  | < 85%   | 인스턴스 메트릭    |
| 네트워크 대역폭   | < 80%  | < 95%   | 네트워크 모니터링  |
| DB 연결 수        | < 80개 | < 100개 | Cloud SQL 모니터링 |

**4. 가용성 및 안정성**

| 지표             | 목표값 | 측정 방법              |
| ---------------- | ------ | ---------------------- |
| 시스템 가용성    | > 99%  | 다운타임 측정          |
| 헬스 체크 통과율 | 100%   | 로드밸런서 백엔드 상태 |
| 데이터 일관성    | 100%   | 트랜잭션 검증          |
| 서비스 중단 시간 | 0초    | 연속 모니터링          |

#### 정성적 기준 (Qualitative Criteria)

**1. 사용자 경험**

- **응답성**: 사용자 액션에 대한 즉각적인 피드백 제공
- **안정성**: 부하 상황에서도 페이지 오류 없이 정상 작동
- **일관성**: 모든 인스턴스에서 동일한 사용자 경험 제공

**2. 시스템 동작**

- **예측 가능성**: 오토스케일링이 설정된 규칙에 따라 일관되게 작동
- **점진성**: 급격한 변화 없이 부드러운 확장/축소
- **복구력**: 일시적 장애 후 자동 복구

**3. 모니터링 및 관찰성**

- **실시간성**: 모니터링 데이터가 2초 이내 업데이트
- **정확성**: 표시된 지표가 실제 시스템 상태 반영
- **가시성**: 중요 지표를 한눈에 파악 가능

#### 합격/불합격 판정 기준

**합격 (Pass)**

다음 조건을 모두 만족할 경우:

- 오토스케일링 5개 항목 중 4개 이상 목표 달성
- 시스템 성능 5개 항목 중 4개 이상 목표 달성
- 리소스 사용률 모든 항목이 임계값 이내
- 가용성 및 안정성 모든 항목 목표 달성
- 정성적 기준 중 심각한 문제 없음

**조건부 합격 (Conditional Pass)**

다음 조건을 만족할 경우:

- 핵심 기능(오토스케일링, 가용성)은 정상 작동
- 일부 성능 지표가 허용 범위 내에 있음
- 개선 계획이 명확히 수립됨

**불합격 (Fail)**

다음 중 하나라도 발생할 경우:

- 오토스케일링 작동 실패
- 시스템 가용성 < 95%
- 에러율 > 10%
- 서비스 중단 발생
- 데이터 손실 또는 불일치 발생

---

## 4.2 테스트 환경 구성

### 4.2.1 초기 시스템 상태

부하 테스트 시작 전 시스템의 초기 상태를 다음과 같이 설정하였다. 이는 테스트 결과의 재현성과 비교 가능성을 보장하기 위함이다.

#### 인프라 구성

**Compute Engine 인스턴스**

```
인스턴스 그룹: football-app-group-v2
├─ 인스턴스 개수: 2개 (최소값)
├─ 인스턴스 타입: e2-micro
│  ├─ vCPU: 2개
│  ├─ 메모리: 1GB
│  └─ 디스크: 10GB 표준 영구 디스크
├─ 네트워크: football-vpc / web-subnet
├─ 내부 IP: 10.0.1.x 범위
└─ 외부 IP: 없음 (프라이빗 인스턴스)
```

**로드밸런서**

```
이름: football-load-balancer
├─ 유형: HTTP(S) 로드밸런서 (전역)
├─ 프런트엔드 IP: 136.110.134.8
├─ 프로토콜: HTTP (포트 80)
├─ 백엔드 서비스: football-backend-service
│  ├─ 백엔드 그룹: football-app-group-v2
│  ├─ 포트: 3000
│  ├─ 프로토콜: HTTP
│  └─ 헬스 체크: football-health-check
└─ 세션 어피니티: 없음
```

**Cloud SQL**

```
인스턴스 ID: [인스턴스명]
├─ 데이터베이스 버전: MySQL 8.0
├─ 리전: asia-northeast3 (서울)
├─ 인스턴스 타입: db-f1-micro
│  ├─ vCPU: 1개 공유
│  └─ 메모리: 0.6GB
├─ 스토리지: 10GB SSD
├─ 연결 방식: 공개 IP
└─ 상태: 실행 중
```

#### 애플리케이션 상태

**웹 서버 (Node.js + Express)**

```
Node.js 버전: v18.x
Express 버전: 4.x
프로세스 관리: systemd
├─ 서비스명: football-app
├─ 자동 시작: 활성화
├─ 재시작 정책: always
└─ 로그: journalctl
```

**데이터베이스 스키마**

```sql
-- 테이블 구성
users (사용자)
├─ id (PK)
├─ email (UNIQUE)
├─ password (해시)
├─ name
└─ phone

matches (경기)
├─ id (PK)
├─ home_team
├─ away_team
├─ match_date
├─ stadium
├─ price
├─ total_seats
└─ available_seats

bookings (예매)
├─ id (PK)
├─ user_id (FK)
├─ match_id (FK)
├─ seat_number
├─ booking_status
└─ created_at
```

**초기 데이터**

- 사용자: 0명 (테스트 중 생성)
- 경기: 5개 (사전 입력)
- 예매: 0건 (테스트 중 생성)

#### 네트워크 구성

**VPC 및 서브넷**

```
VPC: football-vpc
├─ web-subnet: 10.0.1.0/24 (웹 서버)
├─ db-subnet: 10.0.2.0/24 (데이터베이스)
└─ lb-subnet: 10.0.3.0/24 (로드밸런서)
```

**방화벽 규칙**

```
1. football-allow-ssh
   ├─ 대상: 모든 인스턴스
   ├─ 소스: 0.0.0.0/0
   └─ 포트: TCP 22

2. football-allow-lb-to-web
   ├─ 대상: 태그 football-app
   ├─ 소스: 130.211.0.0/22, 35.191.0.0/16
   └─ 포트: TCP 3000

3. football-allow-health-check
   ├─ 대상: 태그 football-app
   ├─ 소스: 130.211.0.0/22, 35.191.0.0/16
   └─ 포트: TCP 3000

4. football-allow-internal
   ├─ 대상: 모든 인스턴스
   ├─ 소스: 10.0.0.0/16
   └─ 포트: 모두

5. football-allow-http-https
   ├─ 대상: 태그 http-server
   ├─ 소스: 0.0.0.0/0
   └─ 포트: TCP 80, 443
```

**Cloud NAT**

```
NAT 게이트웨이: football-nat-gateway
├─ 리전: asia-northeast3
├─ Cloud Router: football-router
├─ 소스: 모든 서브넷
└─ IP 주소: 자동 할당
```

#### 초기 성능 지표

테스트 시작 전 측정한 기준선(Baseline) 지표:

| 지표              | 측정값          |
| ----------------- | --------------- |
| CPU 사용률        | 0-5%            |
| 메모리 사용률     | 35-40%          |
| 네트워크 트래픽   | < 1 Mbps        |
| 활성 연결 수      | 0개             |
| 데이터베이스 연결 | 2개 (풀 최소값) |
| 평균 응답 시간    | 50-100ms        |
| 동시 사용자       | 0명             |

---

### 4.2.2 오토스케일링 설정 확인

Managed Instance Group의 오토스케일링 설정을 다음과 같이 구성하고 검증하였다.

#### 자동 확장 정책 (Scale-Out Policy)

**기본 설정**

```
최소 인스턴스 수: 2개
최대 인스턴스 수: 5개
목표 CPU 사용률: 10%
확장 모드: 점진적 확장 (Gradual)
```

**상세 파라미터**

| 파라미터              | 설정값 | 설명                                  |
| --------------------- | ------ | ------------------------------------- |
| Cool-down Period      | 60초   | 확장 후 다음 확장까지 대기 시간       |
| Initialization Period | 30초   | 새 인스턴스 준비 시간                 |
| Scale-out Step        | 1개    | 한 번에 추가할 인스턴스 수            |
| Max Surge             | 3개    | 동시 생성 가능한 최대 인스턴스        |
| Max Unavailable       | 1개    | 업데이트 시 중단 가능한 최대 인스턴스 |

**확장 트리거 조건**

```
IF (평균 CPU 사용률 > 10%) AND (지속 시간 > 60초)
THEN 인스턴스 추가 (현재 개수 + 1)
```

확장은 다음과 같은 순서로 진행된다:

1. 모든 인스턴스의 평균 CPU 사용률 계산
2. 목표 CPU 사용률(10%) 초과 여부 확인
3. 60초 동안 지속되는지 확인
4. 초기화 기간(30초) 고려하여 새 인스턴스 생성
5. 새 인스턴스가 헬스 체크 통과할 때까지 대기
6. 로드밸런서에 자동 등록

#### 자동 축소 정책 (Scale-In Policy)

**기본 설정**

```
축소 트리거: CPU 사용률 < 10%
축소 대기 시간: 10분 (안정화 기간)
축소 속도: 점진적 (한 번에 1개씩)
```

**상세 파라미터**

| 파라미터               | 설정값 | 설명                       |
| ---------------------- | ------ | -------------------------- |
| Scale-in Stabilization | 600초  | 축소 전 안정화 대기 시간   |
| Scale-in Step          | 1개    | 한 번에 제거할 인스턴스 수 |
| Minimum Instances      | 2개    | 항상 유지할 최소 인스턴스  |

**축소 트리거 조건**

```
IF (평균 CPU 사용률 < 10%) AND (지속 시간 > 600초) AND (현재 개수 > 2)
THEN 인스턴스 제거 (현재 개수 - 1)
```

축소는 다음과 같은 순서로 진행된다:

1. 평균 CPU 사용률이 목표치 이하로 감소
2. 10분 동안 낮은 상태 유지 확인
3. 가장 최근에 생성된 인스턴스 선택
4. 로드밸런서에서 제거 (새 연결 차단)
5. 기존 연결 완료 대기 (Graceful Shutdown)
6. 인스턴스 종료

#### 헬스 체크 설정

**헬스 체크 구성**

```
이름: football-health-check
프로토콜: HTTP
포트: 3000
요청 경로: /health
```

**상세 파라미터**

| 파라미터            | 설정값 | 설명             |
| ------------------- | ------ | ---------------- |
| Check Interval      | 10초   | 헬스 체크 주기   |
| Timeout             | 5초    | 응답 대기 시간   |
| Healthy Threshold   | 2회    | 정상 판정 기준   |
| Unhealthy Threshold | 3회    | 비정상 판정 기준 |

**헬스 체크 엔드포인트**

```javascript
// server.js
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});
```

**헬스 체크 로직**

```
1. 로드밸런서가 10초마다 /health 엔드포인트 호출
2. 5초 이내 응답 없으면 실패로 간주
3. 연속 3회 실패 시 인스턴스를 비정상으로 표시
4. 비정상 인스턴스는 트래픽 수신 중단
5. 연속 2회 성공 시 다시 정상으로 복귀
```

#### 설정 검증 절차

테스트 시작 전 다음 항목을 확인하였다:

**1. GCP Console 확인**

```
Compute Engine → 인스턴스 그룹 → football-app-group-v2 → 수정
├─ 최소 인스턴스: 2 ✓
├─ 최대 인스턴스: 5 ✓
├─ 목표 CPU: 10% ✓
├─ 초기화 기간: 30초 ✓
└─ 헬스 체크: football-health-check ✓
```

**2. 헬스 체크 동작 확인**

```bash
# 각 인스턴스에서 헬스 체크 엔드포인트 테스트
curl http://localhost:3000/health

# 예상 응답
{
  "status": "OK",
  "message": "Server is running",
  "timestamp": "2025-11-22T05:30:00.000Z"
}
```

**3. 로드밸런서 백엔드 상태 확인**

```
네트워크 서비스 → 부하 분산 → football-load-balancer → 백엔드
└─ football-backend-service
   └─ football-app-group-v2: 2/2 HEALTHY ✓
```

모든 검증 항목이 정상임을 확인한 후 부하 테스트를 시작하였다.

---

### 4.2.3 모니터링 도구 설정

부하 테스트 중 시스템 상태를 실시간으로 관찰하기 위해 다중 모니터링 도구를 구성하였다.

#### GCP Cloud Monitoring

**인스턴스 그룹 모니터링**

```
Compute Engine → 인스턴스 그룹 → football-app-group-v2 → 모니터링 탭

측정 지표:
├─ CPU 사용률 (%)
├─ 메모리 사용률 (%)
├─ 네트워크 송수신 (Bytes/s)
├─ 디스크 I/O (Operations/s)
└─ 인스턴스 개수 (Count)

시간 범위: 최근 1시간
업데이트 주기: 1분
```

**로드밸런서 모니터링**

```
네트워크 서비스 → 부하 분산 → football-load-balancer → 모니터링 탭

측정 지표:
├─ 요청 수 (Requests/s)
├─ 백엔드 지연 시간 (ms)
├─ 프런트엔드 RTT (ms)
├─ 백엔드 요청 수 (Requests/s)
└─ 에러율 (%)

시간 범위: 최근 1시간
업데이트 주기: 1분
```

**Cloud SQL 모니터링**

```
SQL → 인스턴스 선택 → 모니터링 탭

측정 지표:
├─ CPU 사용률 (%)
├─ 메모리 사용률 (%)
├─ 활성 연결 수 (Count)
├─ 쿼리 실행 시간 (ms)
└─ 읽기/쓰기 작업 (Operations/s)

시간 범위: 최근 1시간
업데이트 주기: 1분
```

#### 웹 기반 실시간 모니터링 위젯

사용자 인터페이스에 통합된 실시간 모니터링 위젯을 구현하였다.

**위젯 구성**

```javascript
// 모니터링 위젯 구조
{
  CPU 사용률: {
    현재값: "4.02%",
    프로그레스바: 시각화,
    업데이트: 2초마다
  },
  메모리 사용률: {
    현재값: "40.29%",
    프로그레스바: 시각화,
    업데이트: 2초마다
  },
  시스템 정보: {
    CPU 코어: "2개",
    총 메모리: "0.93 GB",
    가동시간: "47분",
    서버명: "football-app-group-v2-q0z4"
  },
  활성 인스턴스: {
    현재값: "2개",
    강조 표시: true,
    업데이트: 2초마다
  },
  부하 테스트: {
    상태: "대기 중",
    통계: {
      사용자수: 0,
      성공: 0,
      실패: 0
    }
  }
}
```

**데이터 수집 메커니즘**

```javascript
// 2초마다 서버에서 시스템 정보 조회
setInterval(async () => {
  const response = await fetch("/api/monitor/system");
  const data = await response.json();

  // 위젯 업데이트
  updateMonitoringWidget(data);
}, 2000);
```

**API 엔드포인트**

```javascript
// routes/monitor.js
router.get("/system", (req, res) => {
  osUtils.cpuUsage((cpuPercent) => {
    res.json({
      cpu: {
        usage: (cpuPercent * 100).toFixed(2),
        cores: os.cpus().length,
      },
      memory: {
        total: (os.totalmem() / 1024 / 1024 / 1024).toFixed(2),
        usagePercent: ((usedMem / totalMem) * 100).toFixed(2),
      },
      system: {
        hostname: os.hostname(),
        uptime: Math.floor(os.uptime() / 60),
      },
      instances: {
        count: process.env.INSTANCE_COUNT || "N/A",
      },
    });
  });
});
```

#### 로그 수집 및 분석

**애플리케이션 로그**

```bash
# systemd 로그 확인
sudo journalctl -u football-app -f

# 로그 레벨
INFO: 일반 정보
WARN: 경고 (성능 저하 등)
ERROR: 오류 (요청 실패 등)
```

**접근 로그**

```javascript
// Express 미들웨어
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.url} ${res.statusCode} ${duration}ms`);
  });
  next();
});
```

#### 모니터링 대시보드 구성

테스트 진행 중 다음과 같은 화면 배치로 모니터링하였다:

```
모니터 1 (주 화면):
├─ 웹 브라우저: 부하 테스트 실행 및 위젯 관찰
└─ 크기: 전체 화면

모니터 2 (보조 화면) 또는 탭 분할:
├─ GCP Console: 인스턴스 그룹 모니터링
├─ GCP Console: 로드밸런서 모니터링
└─ 스크린샷 도구: 즉시 캡처 준비

기록 도구:
├─ 스프레드시트: 타이밍 데이터 기록
├─ 메모장: 관찰 사항 기록
└─ 스크린샷 폴더: 자동 저장 위치
```

이러한 다층 모니터링 구조를 통해 시스템의 모든 계층에서 발생하는 변화를 실시간으로 추적하고 기록할 수 있었다.

---

## 4.3 부하 생성 메커니즘

### 4.3.1 부하 생성 방식

본 프로젝트에서는 클라이언트 사이드 JavaScript 기반의 부하 생성 방식을 채택하였다. 이는 실제 사용자의 브라우저에서 발생하는 트래픽 패턴을 가장 정확하게 재현할 수 있는 방법이다.

#### 부하 생성 아키텍처

**전체 구조**

```
사용자 브라우저 (클라이언트)
    ↓
JavaScript 부하 생성 엔진
    ↓ (HTTP 요청)
로드밸런서 (136.110.134.8:80)
    ↓ (트래픽 분산)
백엔드 인스턴스들 (2-5개)
    ↓ (데이터베이스 쿼리)
Cloud SQL (MySQL)
```

**부하 생성 엔진 구현**

```javascript
// 부하 테스트 제어 변수
let loadTestInterval; // 타이머 ID
let loadTestActive = false; // 실행 상태
let requestCount = 0; // 총 요청 수
let successCount = 0; // 성공 요청 수
let errorCount = 0; // 실패 요청 수

// 부하 테스트 시작 함수
async function startLoadTest() {
  if (loadTestActive) return;

  loadTestActive = true;
  requestCount = 0;
  successCount = 0;
  errorCount = 0;

  // 현재 페이지 컨텍스트 확인
  const isLoggedIn = localStorage.getItem("token");
  const isModalOpen = document
    .getElementById("stadium-modal")
    .classList.contains("active");

  // 컨텍스트별 메시지 표시
  let statusText = "";
  if (!isLoggedIn) {
    statusText = "🔐 대량 회원가입/로그인 시뮬레이션 중...";
  } else if (isModalOpen) {
    statusText = "🎫 동시 티켓 예매 시뮬레이션 중...";
  } else {
    statusText = "📋 경기 조회 및 예매 내역 시뮬레이션 중...";
  }

  document.getElementById("load-test-status").textContent = statusText;
  document.getElementById("load-test-stats").style.display = "block";

  // 부하 생성 시작
  loadTestInterval = setInterval(() => {
    // 동시에 50명의 가상 사용자 생성
    for (let i = 0; i < 50; i++) {
      simulateTicketingUser();
    }
  }, 100); // 0.1초마다 50명 = 초당 500명
}
```

#### 부하 강도 설정

**기본 파라미터**

| 파라미터           | 설정값 | 설명                         |
| ------------------ | ------ | ---------------------------- |
| 동시 사용자 수     | 50명   | 한 번에 생성되는 가상 사용자 |
| 생성 주기          | 100ms  | 사용자 생성 간격             |
| 초당 요청 수 (RPS) | 500개  | 50명 × 10회/초               |
| 요청 타입          | 비동기 | fetch API 사용               |
| 타임아웃           | 30초   | 응답 대기 시간               |

**부하 강도 계산**

```
초당 요청 수 (RPS) = (동시 사용자 수 / 생성 주기) × 1000ms
                  = (50 / 100) × 1000
                  = 500 RPS

예상 데이터 전송량:
- 평균 요청 크기: 500 bytes
- 평균 응답 크기: 2 KB
- 초당 전송량: 500 × (0.5 + 2) KB = 1.25 MB/s
```

#### 가상 사용자 시뮬레이션

**사용자 행동 모델링**

```javascript
async function simulateTicketingUser() {
  requestCount++;
  updateLoadTestStats();

  try {
    // 현재 페이지 컨텍스트에 따라 시나리오 선택
    const isLoggedIn = localStorage.getItem("token");
    const isModalOpen = document
      .getElementById("stadium-modal")
      .classList.contains("active");

    let success = false;

    if (!isLoggedIn) {
      // 시나리오 1: 로그인 페이지
      success = await simulateAuthFlow();
    } else if (isModalOpen) {
      // 시나리오 3: 티켓 예매 모달
      success = await simulateBookingFlow();
    } else {
      // 시나리오 2: 메인 페이지
      success = await simulateMainPageFlow();
    }

    if (success) {
      successCount++;
    } else {
      errorCount++;
    }
  } catch (error) {
    errorCount++;
  }

  updateLoadTestStats();
}
```

**시나리오별 구현**

```javascript
// 시나리오 1: 인증 플로우
async function simulateAuthFlow() {
  const rand = Math.random();

  if (rand < 0.5) {
    // 50%: 회원가입
    const randomEmail = `user${Math.floor(Math.random() * 1000000)}@test.com`;
    const randomName = `사용자${Math.floor(Math.random() * 10000)}`;

    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: randomEmail,
        password: "test1234",
        name: randomName,
        phone: "010-0000-0000",
      }),
    });

    return response.ok;
  } else {
    // 50%: 로그인 시도
    const randomEmail = `user${Math.floor(Math.random() * 100)}@test.com`;

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: randomEmail,
        password: "test1234",
      }),
    });

    // 로그인 실패도 서버 부하로 간주
    return response.ok || response.status === 401;
  }
}

// 시나리오 2: 메인 페이지 플로우
async function simulateMainPageFlow() {
  const rand = Math.random();

  if (rand < 0.6) {
    // 60%: 경기 목록 조회
    const response = await fetch("/api/matches");
    return response.ok;
  } else {
    // 40%: 내 예매 내역 조회
    const userId = Math.floor(Math.random() * 100) + 1;
    const response = await fetch(`/api/matches/my-bookings/${userId}`);
    return response.ok;
  }
}

// 시나리오 3: 예매 플로우
async function simulateBookingFlow() {
  const rand = Math.random();
  const matchId = currentMatchId || Math.floor(Math.random() * 5) + 1;

  if (rand < 0.7) {
    // 70%: 좌석 조회
    const response = await fetch(`/api/matches/${matchId}/booked-seats`);
    return response.ok;
  } else {
    // 30%: 경기 정보 조회
    const response = await fetch("/api/matches");
    return response.ok;
  }
}
```

#### 통계 수집 및 표시

**실시간 통계 업데이트**

```javascript
function updateLoadTestStats() {
  document.getElementById("request-count").textContent = requestCount;
  document.getElementById("success-count").textContent = successCount;
  document.getElementById("error-count").textContent = errorCount;

  // 성공률 계산
  const successRate =
    requestCount > 0 ? ((successCount / requestCount) * 100).toFixed(2) : 0;

  // 콘솔에 주기적 로그
  if (requestCount % 1000 === 0) {
    console.log(`Progress: ${requestCount} requests, ${successRate}% success`);
  }
}
```

**부하 중지 메커니즘**

```javascript
function stopLoadTest() {
  if (!loadTestActive) return;

  loadTestActive = false;
  clearInterval(loadTestInterval);

  document.getElementById("start-load-btn").disabled = false;
  document.getElementById("stop-load-btn").disabled = true;

  // 최종 통계 표시
  const successRate = ((successCount / requestCount) * 100).toFixed(2);
  document.getElementById(
    "load-test-status"
  ).textContent = `티켓팅 시뮬레이션 완료! 총 ${requestCount}명의 사용자 (성공률: ${successRate}%)`;
}
```

#### 부하 생성 방식의 장단점

**장점**

1. **실제 사용자 환경 재현**: 브라우저에서 실행되므로 실제 사용자와 동일한 네트워크 경로 사용
2. **구현 용이성**: 별도의 부하 테스트 도구 설치 불필요
3. **시각적 피드백**: 실시간으로 통계를 확인하며 테스트 진행
4. **컨텍스트 인식**: 현재 페이지에 맞는 시나리오 자동 선택
5. **비용 효율성**: 추가 인프라 없이 클라이언트에서 실행

**단점**

1. **브라우저 제약**: 브라우저의 동시 연결 수 제한 (일반적으로 6-8개)
2. **클라이언트 리소스**: 사용자 PC의 CPU/메모리 사용
3. **네트워크 의존성**: 사용자의 네트워크 상태에 영향받음
4. **확장성 제한**: 매우 높은 부하 생성에는 한계

**제약 사항 극복 방법**

브라우저의 동시 연결 수 제한을 극복하기 위해 다음 전략을 사용하였다:

```javascript
// 비동기 요청으로 연결 재사용
async function sendRequest() {
  // fetch는 HTTP/1.1 Keep-Alive 또는 HTTP/2 멀티플렉싱 사용
  // 연결을 재사용하여 동시 연결 수 제한 우회
  const response = await fetch(url);
  return response;
}

// 요청 간 최소 지연 없이 연속 발송
for (let i = 0; i < 50; i++) {
  sendRequest(); // await 없이 즉시 발송
}
```

이러한 방식으로 브라우저의 제약을 최소화하면서도 충분한 부하를 생성할 수 있었다.

---

### 4.3.2 트래픽 패턴

부하 테스트에서 생성되는 트래픽 패턴은 실제 티켓팅 서비스의 사용자 행동을 반영하도록 설계하였다.

#### 시나리오별 트래픽 분포

**시나리오 1: 로그인 페이지 (인증 플로우)**

```
트래픽 구성:
├─ 회원가입: 50% (250 RPS)
│  ├─ POST /api/auth/signup
│  ├─ 요청 크기: ~200 bytes
│  ├─ 응답 크기: ~150 bytes
│  └─ 예상 응답 시간: 200-300ms
│
└─ 로그인: 50% (250 RPS)
   ├─ POST /api/auth/login
   ├─ 요청 크기: ~150 bytes
   ├─ 응답 크기: ~500 bytes (JWT 포함)
   └─ 예상 응답 시간: 150-250ms

데이터베이스 영향:
├─ INSERT 쿼리: 250 QPS (회원가입)
├─ SELECT 쿼리: 250 QPS (로그인)
└─ 총 쿼리 수: 500 QPS

리소스 사용 특성:
├─ CPU: 높음 (bcrypt 해싱, JWT 생성)
├─ 메모리: 중간 (세션 데이터)
├─ 네트워크: 낮음 (작은 페이로드)
└─ 디스크 I/O: 중간 (데이터베이스 쓰기)
```

**시나리오 2: 메인 페이지 (조회 플로우)**

```
트래픽 구성:
├─ 경기 목록 조회: 60% (300 RPS)
│  ├─ GET /api/matches
│  ├─ 요청 크기: ~100 bytes
│  ├─ 응답 크기: ~3 KB (경기 5개)
│  └─ 예상 응답 시간: 100-200ms
│
└─ 예매 내역 조회: 40% (200 RPS)
   ├─ GET /api/matches/my-bookings/:userId
   ├─ 요청 크기: ~100 bytes
   ├─ 응답 크기: ~2 KB
   └─ 예상 응답 시간: 150-250ms

데이터베이스 영향:
├─ SELECT 쿼리 (단순): 300 QPS
├─ SELECT 쿼리 (JOIN): 200 QPS
└─ 총 쿼리 수: 500 QPS

리소스 사용 특성:
├─ CPU: 중간 (JSON 직렬화)
├─ 메모리: 중간 (쿼리 결과 버퍼링)
├─ 네트워크: 중간 (JSON 데이터)
└─ 디스크 I/O: 높음 (데이터베이스 읽기)
```

**시나리오 3: 티켓 예매 모달 (좌석 조회)**

```
트래픽 구성:
├─ 좌석 조회: 70% (350 RPS)
│  ├─ GET /api/matches/:matchId/booked-seats
│  ├─ 요청 크기: ~100 bytes
│  ├─ 응답 크기: ~500 bytes
│  └─ 예상 응답 시간: 80-150ms
│
└─ 경기 정보: 30% (150 RPS)
   ├─ GET /api/matches
   ├─ 요청 크기: ~100 bytes
   ├─ 응답 크기: ~3 KB
   └─ 예상 응답 시간: 100-200ms

데이터베이스 영향:
├─ SELECT 쿼리 (좌석): 350 QPS
├─ SELECT 쿼리 (경기): 150 QPS
└─ 총 쿼리 수: 500 QPS

리소스 사용 특성:
├─ CPU: 낮음-중간
├─ 메모리: 낮음
├─ 네트워크: 낮음-중간
└─ 디스크 I/O: 중간 (데이터베이스 읽기)
```

#### 시간대별 트래픽 패턴

**부하 테스트 전체 타임라인**

```
시간 (분)  |  RPS  |  인스턴스  |  CPU (%)  |  상태
-----------|-------|-----------|-----------|-------------
0:00       |   0   |     2     |    5%     | 초기 상태
0:01       |  500  |     2     |   15%     | 부하 시작
0:02       |  500  |     2     |   25%     | CPU 상승
0:03       |  500  |     3     |   20%     | 첫 확장
0:05       |  500  |     4     |   18%     | 두 번째 확장
0:07       |  500  |     5     |   15%     | 최대 확장
0:10       |   0   |     5     |    8%     | 부하 중지
0:15       |   0   |     4     |    5%     | 첫 축소
0:20       |   0   |     3     |    4%     | 두 번째 축소
0:25       |   0   |     2     |    3%     | 최소 복귀
```

#### 트래픽 특성 분석

**요청 분포**

```
HTTP 메서드 분포:
├─ GET: 70% (조회 작업)
├─ POST: 30% (생성 작업)
└─ PUT/DELETE: 0% (테스트 범위 외)

엔드포인트 분포:
├─ /api/auth/*: 25%
├─ /api/matches: 40%
├─ /api/matches/my-bookings/*: 20%
├─ /api/matches/*/booked-seats: 10%
└─ /api/monitor/system: 5%

응답 코드 분포 (예상):
├─ 200 OK: 85-90%
├─ 201 Created: 5-8%
├─ 401 Unauthorized: 3-5%
├─ 404 Not Found: 1-2%
└─ 500 Server Error: < 1%
```

**데이터 전송량**

```
평균 요청 크기: 150 bytes
평균 응답 크기: 1.5 KB
초당 전송량:
├─ 업로드: 500 × 150 bytes = 75 KB/s
├─ 다운로드: 500 × 1.5 KB = 750 KB/s
└─ 총: 825 KB/s ≈ 0.8 MB/s

분당 전송량: 0.8 MB/s × 60 = 48 MB/min
10분 테스트 총량: 48 MB × 10 = 480 MB
```

#### 부하 패턴의 현실성

본 테스트의 트래픽 패턴은 다음과 같은 실제 시나리오를 반영한다:

**1. 티켓 오픈 직후 (0-3분)**

- 대량의 사용자가 동시 접속
- 회원가입 및 로그인 집중
- 시스템 부하 급증

**2. 경기 선택 단계 (3-7분)**

- 경기 목록 조회 증가
- 좌석 현황 확인
- 지속적인 높은 부하

**3. 부하 감소 (7-10분)**

- 일부 사용자 이탈
- 예매 완료 사용자 증가
- 점진적 부하 감소

**4. 정상 상태 복귀 (10분 이후)**

- 피크 타임 종료
- 일반적인 트래픽 수준
- 시스템 안정화

이러한 패턴은 실제 티켓팅 서비스에서 관찰되는 전형적인 부하 곡선과 유사하며, 시스템의 실전 대응 능력을 효과적으로 검증할 수 있다.
