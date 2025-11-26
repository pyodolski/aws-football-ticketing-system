# 📸 스크린샷 촬영 가이드

## 🎯 목적

부하 테스트 및 오토스케일링 과정을 시각적으로 문서화하여 보고서에 활용

---

## 📋 촬영 순서 및 방법

### Phase 1: 초기 상태 (부하 전)

#### 1. 인스턴스 그룹 초기 상태

**경로**: Compute Engine → 인스턴스 그룹 → football-app-group-v2 → 멤버 탭

**촬영 내용**:

- 인스턴스 2개 표시
- 각 인스턴스 이름, IP, 상태 (정상)
- 생성 시간

**파일명**: `01-initial-instances-2.png`

---

#### 2. CPU 사용률 초기 상태

**경로**: 인스턴스 그룹 → 모니터링 탭

**촬영 내용**:

- CPU 사용률 그래프 (낮은 상태)
- 시간 범위: 최근 1시간
- 평균 CPU 사용률 표시

**파일명**: `02-initial-cpu-low.png`

---

#### 3. 웹 페이지 모니터링 위젯

**경로**: http://136.110.134.8/ (로그인 후)

**촬영 내용**:

- 실시간 모니터링 위젯 전체
- CPU 사용률
- 메모리 사용률
- **활성 인스턴스: 2개**
- 서버 이름

**파일명**: `03-widget-initial-2-instances.png`

---

### Phase 2: 부하 테스트 시작

#### 4. 로그인 페이지 부하 테스트

**경로**: http://136.110.134.8/ (로그아웃 상태)

**촬영 내용**:

- 모니터링 위젯
- 부하 테스트 섹션
- 메시지: "🔐 대량 회원가입/로그인 시뮬레이션 중..."
- 통계: 사용자 수, 성공, 실패

**파일명**: `04-login-load-test-running.png`

---

#### 5. 메인 페이지 부하 테스트

**경로**: http://136.110.134.8/ (로그인 후)

**촬영 내용**:

- 모니터링 위젯
- 메시지: "📋 경기 조회 및 예매 내역 시뮬레이션 중..."
- 통계 증가 중

**파일명**: `05-main-load-test-running.png`

---

#### 6. CPU 사용률 증가

**경로**: GCP Console → 인스턴스 그룹 → 모니터링 탭

**촬영 내용**:

- CPU 사용률 그래프 급상승
- 목표 CPU 사용률 (10%) 초과
- 시간대 표시

**파일명**: `06-cpu-increase-above-target.png`

---

### Phase 3: 오토스케일링 (확장)

#### 7. 인스턴스 3개로 확장

**경로**: 인스턴스 그룹 → 멤버 탭

**촬영 내용**:

- 인스턴스 3개 표시
- 새로 생성된 인스턴스 강조
- 생성 시간 확인

**파일명**: `07-autoscale-to-3-instances.png`

**시간 기록**: 부하 시작 후 X분

---

#### 8. 웹 페이지 - 3개 확인

**경로**: 웹 페이지 모니터링 위젯

**촬영 내용**:

- **활성 인스턴스: 3개**
- CPU 사용률 높은 상태

**파일명**: `08-widget-3-instances.png`

---

#### 9. 인스턴스 4개로 확장

**경로**: 인스턴스 그룹 → 멤버 탭

**촬영 내용**:

- 인스턴스 4개 표시

**파일명**: `09-autoscale-to-4-instances.png`

**시간 기록**: 부하 시작 후 X분

---

#### 10. 인스턴스 5개로 확장 (최대)

**경로**: 인스턴스 그룹 → 멤버 탭

**촬영 내용**:

- 인스턴스 5개 표시 (최대값)
- 모든 인스턴스 정상 상태

**파일명**: `10-autoscale-to-5-max-instances.png`

**시간 기록**: 부하 시작 후 X분

---

#### 11. 웹 페이지 - 5개 확인

**경로**: 웹 페이지 모니터링 위젯

**촬영 내용**:

- **활성 인스턴스: 5개**
- 부하 테스트 통계 (높은 숫자)

**파일명**: `11-widget-5-max-instances.png`

---

### Phase 4: 로드밸런서 모니터링

#### 12. 로드밸런서 트래픽

**경로**: 네트워크 서비스 → 부하 분산 → football-load-balancer → 모니터링 탭

**촬영 내용**:

- 요청 수 그래프 (급증)
- 백엔드 지연 시간
- 시간 범위: 최근 1시간

**파일명**: `12-loadbalancer-traffic-spike.png`

---

#### 13. 백엔드 상태

**경로**: 로드밸런서 → 백엔드 탭

**촬영 내용**:

- football-backend-service
- 백엔드 그룹: football-app-group-v2
- 5개 인스턴스 모두 HEALTHY 상태
- 용량 100%

**파일명**: `13-backend-5-healthy-instances.png`

---

### Phase 5: 부하 중지 및 스케일 다운

#### 14. 부하 중지

**경로**: 웹 페이지

**촬영 내용**:

- 부하 중지 버튼 클릭 후
- 완료 메시지
- 최종 통계 (총 사용자 수, 성공, 실패)

**파일명**: `14-load-test-completed-stats.png`

---

#### 15. CPU 사용률 감소

**경로**: GCP Console → 모니터링 탭

**촬영 내용**:

- CPU 사용률 그래프 하락
- 목표치 이하로 감소

**파일명**: `15-cpu-decrease-after-stop.png`

---

#### 16. 인스턴스 스케일 다운

**경로**: 인스턴스 그룹 → 멤버 탭

**촬영 내용**:

- 인스턴스 2개로 감소 (최소값)
- 삭제된 인스턴스 없음 표시

**파일명**: `16-autoscale-down-to-2-min.png`

**시간 기록**: 부하 중지 후 X분

---

### Phase 6: 인프라 구성

#### 17. VPC 네트워크

**경로**: VPC 네트워크 → VPC 네트워크 → football-vpc

**촬영 내용**:

- 서브넷 3개 (web-subnet, db-subnet, lb-subnet)
- IP 범위
- 리전

**파일명**: `17-vpc-network-subnets.png`

---

#### 18. 방화벽 규칙

**경로**: VPC 네트워크 → 방화벽

**촬영 내용**:

- 5개 방화벽 규칙
- 이름, 대상, 필터, 프로토콜/포트

**파일명**: `18-firewall-rules-list.png`

---

#### 19. Cloud NAT

**경로**: 네트워크 서비스 → Cloud NAT

**촬영 내용**:

- NAT 게이트웨이 이름
- 리전
- Cloud Router
- 상태

**파일명**: `19-cloud-nat-gateway.png`

---

### Phase 7: 보안 및 IAM

#### 20. 서비스 계정

**경로**: IAM 및 관리자 → 서비스 계정

**촬영 내용**:

- football-service-account
- 역할 목록

**파일명**: `20-service-account-roles.png`

---

#### 21. IAM 권한

**경로**: IAM 및 관리자 → IAM

**촬영 내용**:

- 프로젝트 구성원 목록
- 역할 할당

**파일명**: `21-iam-permissions.png`

---

### Phase 8: 데이터베이스

#### 22. Cloud SQL 인스턴스

**경로**: SQL → 인스턴스 선택

**촬영 내용**:

- 인스턴스 ID
- 데이터베이스 버전
- 리전
- 연결 이름
- 상태: 실행 중

**파일명**: `22-cloud-sql-instance.png`

---

#### 23. 데이터베이스 연결

**경로**: Cloud SQL → 연결 탭

**촬영 내용**:

- 공개 IP 주소
- 비공개 IP (있는 경우)
- 승인된 네트워크

**파일명**: `23-cloud-sql-connections.png`

---

## 🎨 촬영 팁

### 화면 캡처 도구

- **Windows**: Win + Shift + S
- **Mac**: Cmd + Shift + 4
- **Chrome**: F12 → 스크린샷 도구

### 품질 기준

- **해상도**: 최소 1920x1080
- **포맷**: PNG (압축 없음)
- **파일 크기**: 500KB - 2MB

### 주의사항

- ✅ 전체 화면 또는 관련 영역만 캡처
- ✅ 날짜/시간 표시 포함
- ✅ 중요한 숫자/텍스트 선명하게
- ❌ 민감한 정보 (비밀번호, API 키) 제외
- ❌ 불필요한 탭/창 제외

### 편집

- 중요한 부분 빨간 박스로 강조
- 화살표로 주목할 부분 표시
- 텍스트 주석 추가 (선택사항)

---

## 📁 파일 정리

### 폴더 구조

```
screenshots/
├── 01-initial/
│   ├── 01-initial-instances-2.png
│   ├── 02-initial-cpu-low.png
│   └── 03-widget-initial-2-instances.png
├── 02-load-test/
│   ├── 04-login-load-test-running.png
│   ├── 05-main-load-test-running.png
│   └── 06-cpu-increase-above-target.png
├── 03-autoscale-up/
│   ├── 07-autoscale-to-3-instances.png
│   ├── 08-widget-3-instances.png
│   ├── 09-autoscale-to-4-instances.png
│   ├── 10-autoscale-to-5-max-instances.png
│   └── 11-widget-5-max-instances.png
├── 04-loadbalancer/
│   ├── 12-loadbalancer-traffic-spike.png
│   └── 13-backend-5-healthy-instances.png
├── 05-autoscale-down/
│   ├── 14-load-test-completed-stats.png
│   ├── 15-cpu-decrease-after-stop.png
│   └── 16-autoscale-down-to-2-min.png
├── 06-infrastructure/
│   ├── 17-vpc-network-subnets.png
│   ├── 18-firewall-rules-list.png
│   └── 19-cloud-nat-gateway.png
├── 07-security/
│   ├── 20-service-account-roles.png
│   └── 21-iam-permissions.png
└── 08-database/
    ├── 22-cloud-sql-instance.png
    └── 23-cloud-sql-connections.png
```

---

## ⏱️ 타이밍 기록

### 오토스케일링 타이밍 측정

| 이벤트       | 시간  | 비고      |
| ------------ | ----- | --------- |
| 부하 시작    | 00:00 | 기준 시간 |
| CPU 10% 초과 | 00:XX |           |
| 2→3개 확장   | XX:XX |           |
| 3→4개 확장   | XX:XX |           |
| 4→5개 확장   | XX:XX |           |
| 부하 중지    | XX:XX |           |
| CPU 10% 이하 | XX:XX |           |
| 5→4개 축소   | XX:XX |           |
| 4→3개 축소   | XX:XX |           |
| 3→2개 축소   | XX:XX |           |

---

## ✅ 최종 체크리스트

- [ ] 모든 스크린샷 촬영 완료 (23개)
- [ ] 파일명 규칙 준수
- [ ] 폴더별 정리 완료
- [ ] 타이밍 데이터 기록
- [ ] 백업 저장 (클라우드/외장하드)
- [ ] 보고서에 삽입 준비
