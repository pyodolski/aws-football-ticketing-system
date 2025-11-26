# 데이터베이스 구조

## 개요

축구 티켓팅 시스템을 위한 MySQL 데이터베이스 설계

## ERD (Entity Relationship Diagram)

```
users (사용자)
  ↓ 1:N
bookings (예매)
  ↓ N:1
matches (경기)
```

## 테이블 구조

### 1. users (사용자)

사용자 정보를 관리하는 테이블

| 컬럼명     | 데이터 타입  | 제약조건                    | 설명               |
| ---------- | ------------ | --------------------------- | ------------------ |
| id         | INT          | PRIMARY KEY, AUTO_INCREMENT | 사용자 ID          |
| email      | VARCHAR(100) | UNIQUE, NOT NULL            | 이메일 (로그인 ID) |
| password   | VARCHAR(255) | NOT NULL                    | 비밀번호 (해시)    |
| name       | VARCHAR(50)  | NOT NULL                    | 이름               |
| phone      | VARCHAR(20)  | -                           | 전화번호           |
| created_at | TIMESTAMP    | DEFAULT CURRENT_TIMESTAMP   | 가입일시           |

### 2. matches (경기)

축구 경기 정보를 관리하는 테이블

| 컬럼명          | 데이터 타입    | 제약조건                    | 설명              |
| --------------- | -------------- | --------------------------- | ----------------- |
| id              | INT            | PRIMARY KEY, AUTO_INCREMENT | 경기 ID           |
| home_team       | VARCHAR(50)    | NOT NULL                    | 홈팀              |
| away_team       | VARCHAR(50)    | NOT NULL                    | 원정팀            |
| match_date      | DATETIME       | NOT NULL                    | 경기 일시         |
| stadium         | VARCHAR(100)   | NOT NULL                    | 경기장            |
| total_seats     | INT            | NOT NULL, DEFAULT 1000      | 총 좌석 수        |
| available_seats | INT            | NOT NULL, DEFAULT 1000      | 예매 가능 좌석 수 |
| price           | DECIMAL(10, 2) | NOT NULL                    | 티켓 가격         |
| status          | ENUM           | DEFAULT 'upcoming'          | 경기 상태         |
| created_at      | TIMESTAMP      | DEFAULT CURRENT_TIMESTAMP   | 등록일시          |

**status 값:**

- `upcoming`: 예정
- `ongoing`: 진행 중
- `finished`: 종료
- `cancelled`: 취소

### 3. bookings (예매)

티켓 예매 정보를 관리하는 테이블

| 컬럼명         | 데이터 타입    | 제약조건                           | 설명      |
| -------------- | -------------- | ---------------------------------- | --------- |
| id             | INT            | PRIMARY KEY, AUTO_INCREMENT        | 예매 ID   |
| user_id        | INT            | FOREIGN KEY (users.id), NOT NULL   | 사용자 ID |
| match_id       | INT            | FOREIGN KEY (matches.id), NOT NULL | 경기 ID   |
| seat_number    | VARCHAR(10)    | NOT NULL                           | 좌석 번호 |
| booking_status | ENUM           | DEFAULT 'pending'                  | 예매 상태 |
| total_price    | DECIMAL(10, 2) | NOT NULL                           | 결제 금액 |
| booking_date   | TIMESTAMP      | DEFAULT CURRENT_TIMESTAMP          | 예매일시  |

**booking_status 값:**

- `pending`: 대기 중
- `confirmed`: 확정
- `cancelled`: 취소

**제약조건:**

- UNIQUE KEY (match_id, seat_number): 같은 경기의 같은 좌석은 중복 예매 불가

## 인덱스

성능 최적화를 위한 인덱스 설정

| 인덱스명           | 테이블   | 컬럼       | 목적                           |
| ------------------ | -------- | ---------- | ------------------------------ |
| idx_match_date     | matches  | match_date | 날짜별 경기 조회 최적화        |
| idx_user_bookings  | bookings | user_id    | 사용자별 예매 내역 조회 최적화 |
| idx_match_bookings | bookings | match_id   | 경기별 예매 현황 조회 최적화   |

## 관계 (Relationships)

1. **users → bookings** (1:N)

   - 한 사용자는 여러 예매를 할 수 있음
   - `bookings.user_id` → `users.id`

2. **matches → bookings** (1:N)
   - 한 경기는 여러 예매를 가질 수 있음
   - `bookings.match_id` → `matches.id`

## 샘플 데이터

### 사용자 (3명)

- 김철수 (user1@example.com)
- 이영희 (user2@example.com)
- 박민수 (user3@example.com)

### 경기 (4개)

- FC 서울 vs 수원 삼성 (2025-12-01, 서울월드컵경기장, 30,000원)
- 울산 현대 vs 전북 현대 (2025-12-05, 울산문수경기장, 35,000원)
- 포항 스틸러스 vs 대구 FC (2025-12-10, 포항스틸야드, 25,000원)
- 인천 유나이티드 vs 강원 FC (2025-12-15, 인천축구전용경기장, 28,000원)

### 예매 (4건)

- 김철수: FC 서울 vs 수원 삼성 (A-101)
- 김철수: 울산 현대 vs 전북 현대 (B-205)
- 이영희: FC 서울 vs 수원 삼성 (A-102)
- 박민수: 포항 스틸러스 vs 대구 FC (C-310, 대기 중)
