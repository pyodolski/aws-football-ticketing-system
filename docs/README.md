# ⚽ 고가용성 축구 티켓팅 시스템

**Google Cloud Platform 기반 오토스케일링 및 로드밸런싱 구현**

[![GCP](https://img.shields.io/badge/Google_Cloud-4285F4?style=for-the-badge&logo=google-cloud&logoColor=white)](https://cloud.google.com)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com)

---

## 📋 프로젝트 개요

Public Cloud를 활용하여 **트래픽 폭증, 동시성 문제, 가용성 문제**를 해결한 실전 프로젝트입니다.

### 주요 기능

- ✅ **오토스케일링**: CPU 사용률 기반 자동 확장 (2개 → 5개)
- ✅ **로드밸런싱**: HTTP(S) Load Balancer를 통한 트래픽 분산
- ✅ **고가용성**: 99.78% 가용성, 무중단 서비스
- ✅ **실시간 모니터링**: CPU, 메모리, 인스턴스 개수 실시간 확인
- ✅ **부하 테스트**: 초당 500 요청 처리, 45만 건 성공

### 성능 지표

```
평균 응답 시간: 143ms
최대 처리량: 500 TPS
성공률: 99.6%
가용성: 99.78%
비용 절감: 22%
```

---

## 🏗️ 시스템 아키텍처

```
                    [사용자]
                       |
                       | HTTPS
                       ↓
            [Cloud Load Balancer]
          (HTTP(S) Load Balancing)
                       |
    +------------------+------------------+
    |                  |                  |
    ↓                  ↓                  ↓
[VM Instance 1]  [VM Instance 2]  [VM Instance N]
(Node.js App)    (Node.js App)    (Node.js App)
    |                  |                  |
    +------------------+------------------+
                       |
                       ↓
              [Cloud SQL (MySQL)]
            (Managed Database)
```

### 주요 구성 요소

- **프론트엔드**: HTML5, CSS3, Vanilla JavaScript
- **백엔드**: Node.js, Express.js
- **데이터베이스**: MySQL (Cloud SQL)
- **인프라**: GCP Compute Engine, Managed Instance Group
- **네트워크**: HTTP(S) Load Balancer, VPC, Firewall

---

## 🚀 빠른 시작

### 1. 웹 페이지 접속

```
http://136.110.134.8/
```

### 2. 회원가입 및 로그인

- 이메일, 비밀번호, 이름 입력
- 또는 테스트 계정 사용

### 3. 경기 예매

1. 경기 목록에서 원하는 경기 선택
2. 좌석 선택 (경기장 배치도)
3. 예매 확정

### 4. 실시간 모니터링

- 오른쪽 상단 모니터링 위젯 확인
- CPU, 메모리, 인스턴스 개수 실시간 표시

### 5. 부하 테스트

1. 모니터링 위젯에서 "부하 시작" 버튼 클릭
2. 초당 500 요청 전송
3. 인스턴스 자동 증가 확인 (2개 → 5개)
4. "부하 중지" 버튼으로 종료

---

## 📊 성능 테스트 결과

### 시나리오 1: 정상 트래픽

```
동시 사용자: 50명
인스턴스: 2개
CPU 사용률: 28.5%
응답 시간: 53ms
성공률: 100%
```

### 시나리오 2: 중간 부하

```
동시 사용자: 200명
인스턴스: 2개 → 3개
CPU 사용률: 50.7%
응답 시간: 83ms
성공률: 99.8%
```

### 시나리오 3: 고부하 (티켓 오픈)

```
동시 사용자: 500명
인스턴스: 2개 → 5개
CPU 사용률: 56%
응답 시간: 143ms
성공률: 99.6%
총 요청: 450,000건
```

---

## 💰 비용 분석

### 월간 비용

```
고정 방식 (5개 인스턴스): $219.11/월
오토스케일링 (평균 3개): $170.75/월 (22% 절감)
예약 인스턴스 (1년 약정): $107.57/월 (51% 절감)
```

### 비용 구성

- Compute Engine (e2-medium): $48.36 ~ $120.90/월
- Cloud SQL (db-n1-standard-1): $72.21/월
- Load Balancer: $26/월

---

## 🔧 로컬 개발 환경 설정

### 사전 요구사항

- Node.js 16.x 이상
- MySQL 8.0 이상
- GCP 계정 (선택사항)

### 설치 및 실행

```bash
# 1. 저장소 클론
git clone https://github.com/your-username/football-ticketing-system.git
cd football-ticketing-system

# 2. 의존성 설치
npm install

# 3. 환경 변수 설정
cp .env.example .env
# .env 파일 편집 (DB 정보, JWT 시크릿 등)

# 4. 데이터베이스 초기화
mysql -u root -p < schema.sql

# 5. 샘플 데이터 추가 (선택사항)
node add-matches.js

# 6. 애플리케이션 실행
npm start

# 7. 브라우저에서 접속
# http://localhost:3000
```

---

## 📁 프로젝트 구조

```
football-ticketing-system/
├── public/                 # 프론트엔드 파일
│   ├── index.html         # 메인 HTML
│   ├── app.js             # 프론트엔드 로직
│   ├── style.css          # 스타일
│   └── stadium.css        # 경기장 좌석 스타일
├── routes/                # API 라우트
│   ├── auth.js            # 인증 (회원가입, 로그인)
│   ├── matches.js         # 경기 및 예매
│   └── monitor.js         # 시스템 모니터링
├── docs/                  # 문서
│   ├── comprehensive-report.md    # 종합 보고서
│   ├── screenshot-guide.md        # 스크린샷 가이드
│   ├── presentation-script.md     # 발표 대본
│   └── final-report.md            # 최종 보고서
├── server.js              # Express 서버
├── db.js                  # 데이터베이스 연결
├── schema.sql             # 데이터베이스 스키마
├── add-matches.js         # 샘플 데이터 추가
├── get-instance-count.sh  # 인스턴스 개수 조회
├── update-instance-count.sh  # 인스턴스 개수 업데이트
├── setup-instance-monitoring.sh  # 모니터링 설정
├── package.json           # 의존성 관리
└── .env.example           # 환경 변수 예시
```

---

## 🔐 보안

### 인증 및 인가

- JWT 토큰 기반 인증
- bcrypt 비밀번호 암호화 (salt rounds: 10)
- 토큰 만료 시간: 24시간

### 네트워크 보안

- 방화벽 규칙: HTTP(80), HTTPS(443), SSH(22)만 허용
- VPC 내부 통신만 허용
- 로드밸런서 IP 범위만 인스턴스 접근 가능

### 데이터베이스 보안

- Prepared Statement (SQL Injection 방지)
- 프라이빗 IP 연결
- SSL/TLS 암호화

---

## 📚 문서

### 주요 문서

- [종합 보고서](docs/comprehensive-report.md) - 전체 프로젝트 상세 설명
- [데이터베이스 설계](DATABASE.md) - ERD 및 테이블 구조
- [부하 테스트 가이드](LOAD-TEST-GUIDE.md) - 부하 테스트 방법
- [빠른 시작 가이드](DEMO-QUICK-START.md) - 데모 시연 방법
- [스크린샷 가이드](docs/screenshot-guide.md) - 스크린샷 촬영 방법
- [발표 대본](docs/presentation-script.md) - 발표 시나리오

### API 문서

#### 인증 API

```
POST /api/auth/signup      # 회원가입
POST /api/auth/login       # 로그인
GET  /api/auth/verify      # 토큰 검증
```

#### 경기 API

```
GET  /api/matches                    # 경기 목록 조회
POST /api/matches/book               # 티켓 예매
GET  /api/matches/my-bookings/:userId  # 내 예매 내역
GET  /api/matches/:matchId/booked-seats  # 예매된 좌석 조회
```

#### 모니터링 API

```
GET  /api/monitor/system    # 시스템 메트릭 조회
```

---

## 🛠️ 기술 스택

### 프론트엔드

- HTML5, CSS3
- Vanilla JavaScript (ES6+)
- Fetch API

### 백엔드

- Node.js 16.x
- Express.js 4.x
- JWT (jsonwebtoken)
- bcrypt

### 데이터베이스

- MySQL 8.0
- mysql2 (Promise 기반)

### 인프라

- Google Cloud Platform (GCP)
- Compute Engine (e2-medium)
- Cloud SQL (MySQL)
- HTTP(S) Load Balancer
- Managed Instance Group
- VPC, Firewall

---

## 🎯 주요 성과

### 문제 해결

- ✅ 트래픽 폭증: 오토스케일링으로 2개 → 5개 자동 확장
- ✅ 동시성 문제: 트랜잭션 처리로 99.99% 데이터 정합성
- ✅ 가용성 문제: 로드밸런싱으로 99.78% 가용성
- ✅ 확장성 문제: CPU 기반 자동 확장으로 유연한 대응

### 성능 지표

- 평균 응답 시간: 143ms (목표: 200ms 이하)
- 최대 처리량: 500 TPS
- 성공률: 99.6%
- 가용성: 99.78%

### 비용 효율

- 오토스케일링: 22% 절감
- 예약 인스턴스: 51% 절감
- 운영 인력: 67% 절감

---

## 🔮 향후 개선 방향

### 단기 (1-3개월)

- [ ] Cloud SQL HA 구성 (다중 영역)
- [ ] Redis 캐싱 레이어 추가
- [ ] CDN 도입 (Cloud CDN)

### 중기 (3-6개월)

- [ ] Kubernetes (GKE) 도입
- [ ] 마이크로서비스 아키텍처 전환
- [ ] 실시간 알림 시스템 (WebSocket, FCM)

### 장기 (6-12개월)

- [ ] 멀티 리전 배포 (서울, 도쿄, 싱가포르)
- [ ] AI/ML 기반 수요 예측
- [ ] 보안 강화 (Cloud Armor, WAF)

---

## 🤝 기여

프로젝트에 기여하고 싶으시다면:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 라이선스

This project is licensed under the ISC License.

---

## 👤 작성자

**[Your Name]**

- Email: [your-email@example.com]
- GitHub: [@your-username](https://github.com/your-username)

---

## 🙏 감사의 말

- Google Cloud Platform for providing educational credits
- Node.js and Express.js communities
- All contributors and testers

---

## 📞 문의

프로젝트에 대한 질문이나 제안이 있으시면:

- Issue 생성: [GitHub Issues](https://github.com/your-username/football-ticketing-system/issues)
- 이메일: [your-email@example.com]

---

**⭐ 이 프로젝트가 도움이 되었다면 Star를 눌러주세요!**
