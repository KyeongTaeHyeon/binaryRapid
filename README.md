# 🍜 Rapid - 라멘 맛집 커뮤니티 플랫폼

> 사용자 참여형 라멘 맛집 정보 공유 및 관리 시스템

**Rapid**는 라멘 애호가들이 직접 맛집 정보를 등록하고 공유할 수 있는 커뮤니티 기반 플랫폼입니다. 사용자는 자신이 방문한 라멘 맛집을 신청하고, 관리자의 검토를 거쳐 승인된 정보만 플랫폼에 게시됩니다. 이를
통해 신뢰성 있는 맛집 정보를 제공하며, 취향별 검색, 찜 기능, 커뮤니티 게시판 등 다양한 기능을 제공합니다.

---

## 📋 목차

1. [기술 스택](#-기술-스택)
2. [주요 기능](#-주요-기능)
3. [데이터베이스 설계](#-데이터베이스-설계)
4. [핵심 비즈니스 로직](#-핵심-비즈니스-로직)
5. [API 명세](#-api-명세)
6. [보안 및 인증](#-보안-및-인증)
7. [설치 및 실행](#-설치-및-실행)

---

## 🛠 기술 스택

### Backend

| 기술                       | 버전     | 용도              |
|--------------------------|--------|-----------------|
| **Java**                 | 21     | 주 개발 언어         |
| **Spring Boot**          | 3.5.9  | 애플리케이션 프레임워크    |
| **Spring Security**      | 6.x    | 인증/인가 처리        |
| **Spring OAuth2 Client** | -      | 소셜 로그인 (Google) |
| **MyBatis**              | 3.0.5  | SQL 매핑 프레임워크    |
| **MySQL**                | 8.0+   | 관계형 데이터베이스      |
| **JWT (jjwt)**           | 0.11.5 | 토큰 기반 인증        |
| **Log4j2**               | -      | 로깅 프레임워크        |
| **Log4jdbc**             | 1.16   | SQL 로깅          |
| **Gradle**               | -      | 빌드 도구           |

### Frontend

| 기술             | 용도               |
|----------------|------------------|
| **Thymeleaf**  | 서버사이드 템플릿 엔진     |
| **jQuery**     | DOM 조작 및 AJAX 통신 |
| **Bootstrap**  | UI 컴포넌트 라이브러리    |
| **HTML5/CSS3** | 마크업 및 스타일링       |

### Infrastructure

- **IDE**: IntelliJ IDEA
- **VCS**: Git
- **Server**: Embedded Tomcat (Spring Boot)
- **File Storage**: 로컬 파일 시스템 (외부 업로드 디렉토리)

---

## ✨ 주요 기능

### 🔐 사용자 인증/인가

- **일반 회원가입/로그인**
    - BCrypt 암호화를 통한 안전한 비밀번호 저장
    - JWT 기반 Stateless 인증 (Access Token + Refresh Token)
    - 쿠키를 통한 토큰 관리 (HttpOnly, SameSite)

- **소셜 로그인**
    - Google OAuth2 연동
    - 자동 회원가입 및 JWT 발급

- **권한 관리**
    - USER: 일반 사용자 권한
    - ADMIN: 관리자 권한 (맛집 승인, 회원 관리 등)

### 🏪 맛집 검색 및 조회

- **다중 필터 검색**
    - 카테고리별 필터링 (라멘 종류: 돈코츠, 소유, 미소 등)
    - 지역별 필터링
    - 복합 필터 조건 지원

- **페이징 처리**
    - Spring Data의 Pageable을 활용한 효율적인 페이징
    - 8개 단위 목록 조회

- **찜(Wishlist) 기능**
    - 로그인 사용자 전용 기능
    - 실시간 찜 상태 토글
    - 마이페이지에서 찜 목록 관리

- **상세 정보 조회**
    - 맛집 기본 정보 (이름, 주소, 설명)
    - 카테고리 정보
    - 이미지 갤러리
    - 찜 상태 표시

### 📝 맛집 신청 (Approval System)

- **사용자 맛집 등록 신청**
    - 맛집 기본 정보 입력 (이름, 주소, 설명)
    - 카테고리 다중 선택
    - 이미지 다중 업로드 (최대 5MB/파일, 20MB/요청)
    - 메인 이미지 지정

- **신청 내역 관리**
    - 내 신청 목록 조회 (마이페이지)
    - 상태별 필터링 (대기/승인/반려)
    - 대기 중인 신청 수정/삭제 가능

- **관리자 승인 프로세스**
    - 신청 목록 조회 및 상세 검토
    - 승인(`req_type = 'Y'`) → 일반 사용자에게 노출
    - 반려(`req_type = 'N'`) → 사용자 마이페이지에서 상태 확인 가능

### 🗂 마이페이지

- **개인정보 관리**
    - 닉네임, 취향 정보 수정
    - 비밀번호 변경

- **찜 목록 관리**
    - 찜한 맛집 목록 조회
    - 찜 해제 기능

- **신청 내역 조회**
    - 내가 신청한 맛집 목록
    - 승인 상태 실시간 확인
    - 제목, 기간별 검색 기능

- **내 게시글 관리**
    - 작성한 게시글 목록 조회

### 💬 커뮤니티 게시판

- **게시글 CRUD**
    - 게시글 작성, 수정, 삭제
    - 파일 첨부 기능 (다중 업로드)
    - 카테고리별 분류

- **댓글 시스템**
    - 댓글 작성, 수정, 삭제
    - 실시간 댓글 목록 조회

- **파일 관리**
    - 안전한 파일 다운로드 (Path Traversal 방지)
    - 외부 업로드 디렉토리 활용

### 🛡 관리자 기능

- **회원 관리**
    - 전체 회원 목록 조회
    - 검색 기능 (카테고리, 키워드, 기간)
    - 회원 상태 관리 (활성화/정지)

- **맛집 승인 관리**
    - 신청된 맛집 목록 조회
    - 탭별 분류 (대기/승인/반려)
    - 페이징 처리
    - 승인/반려 처리

- **공지사항 관리**
    - 공지사항 작성, 수정, 삭제
    - 검색 기능 (제목, 내용)

- **카테고리 관리**
    - 카테고리 그룹 관리 (라멘 종류, 지역 등)
    - 계층형 카테고리 구조
    - Prefix 중복 체크
    - 카테고리 추가, 수정, 삭제

---

## 🗄 데이터베이스 설계

### ERD 개요

시스템은 사용자, 맛집, 게시판, 카테고리의 4개 주요 도메인으로 구성되어 있습니다.

### 주요 테이블 구조

#### 1. 사용자 관련

**`tb_user` (사용자)**

```sql
user_id INT PRIMARY KEY AUTO_INCREMENT
id VARCHAR(50) UNIQUE                   -- 로그인 ID
password VARCHAR(255)                   -- BCrypt 암호화된 비밀번호
nickname VARCHAR(50) UNIQUE             -- 닉네임
name VARCHAR(50)                        -- 실명
email VARCHAR(100) UNIQUE               -- 이메일
taste VARCHAR(50)                       -- 라멘 취향
birth DATE                              -- 생년월일
gender VARCHAR(10)                      -- 성별
social VARCHAR(20)                      -- 소셜 타입 (GOOGLE, NONE 등)
role VARCHAR(20)                        -- 권한 (USER, ADMIN)
create_date DATETIME
update_date DATETIME
delete_date DATETIME                    -- Soft Delete
```

**`tb_refreshtoken` (리프레시 토큰)**

```sql
user_id INT PRIMARY KEY                 -- FK to tb_user
token VARCHAR(500)                      -- Refresh Token
expire_date DATETIME                    -- 만료 시간
```

**`tb_blacklist` (블랙리스트 토큰)**

```sql
id INT PRIMARY KEY AUTO_INCREMENT
token VARCHAR(500) UNIQUE               -- 로그아웃된 Access Token
expire_date DATETIME
```

#### 2. 맛집 관련

**`tb_shop` (맛집 기본 정보)**

```sql
id VARCHAR(20) PRIMARY KEY              -- RS0000000001 형식
name VARCHAR(100)                       -- 맛집 이름
address VARCHAR(255)                    -- 주소
content TEXT                            -- 설명
user_id INT                             -- FK to tb_user (신청자)
req_type VARCHAR(1)                     -- NULL(대기), Y(승인), N(반려)
create_date DATETIME
update_date DATETIME
delete_date DATETIME
```

**`tb_shopdetail` (맛집 상세 정보 - 카테고리 매핑)**

```sql
id VARCHAR(20)                          -- FK to tb_shop
contents VARCHAR(20)                    -- FK to tb_category
user_id INT                             -- FK to tb_user
create_date DATETIME
PRIMARY KEY (id, contents)
```

**`tb_shopimg` (맛집 이미지)**

```sql
id VARCHAR(20)                          -- FK to tb_shop
img_seq INT                             -- 이미지 순번
img_url VARCHAR(500)                    -- 이미지 경로
main_img VARCHAR(1)                     -- Y/N (메인 이미지 여부)
create_date DATETIME
PRIMARY KEY (id, img_seq)
```

**`tb_userwishlist` (찜 목록 - N:M 중간 테이블)**

```sql
user_id INT                             -- FK to tb_user
shop_id VARCHAR(20)                     -- FK to tb_shop
create_date DATETIME
PRIMARY KEY (user_id, shop_id)
```

#### 3. 게시판 관련

**`tb_board` (게시글)**

```sql
id INT PRIMARY KEY AUTO_INCREMENT
category VARCHAR(50)                    -- 게시글 카테고리
title VARCHAR(200)                      -- 제목
contents TEXT                           -- 내용
user_id INT                             -- FK to tb_user
create_date DATETIME
update_date DATETIME
delete_date DATETIME
```

**`tb_boardcomment` (댓글)**

```sql
id INT PRIMARY KEY AUTO_INCREMENT
board_id INT                            -- FK to tb_board
user_id INT                             -- FK to tb_user
comment TEXT                            -- 댓글 내용
create_date DATETIME
update_date DATETIME
delete_date DATETIME
```

**`tb_boardfile` (게시글 첨부파일)**

```sql
id INT PRIMARY KEY AUTO_INCREMENT
board_id INT                            -- FK to tb_board
file_seq INT                            -- 파일 순번
file_name VARCHAR(255)                  -- 원본 파일명
file_addr VARCHAR(500)                  -- 저장 경로 (storage key)
create_date DATETIME
```

#### 4. 카테고리 관련

**`tb_category` (카테고리)**

```sql
id VARCHAR(20) PRIMARY KEY              -- 카테고리 ID
name VARCHAR(50)                        -- 카테고리명
group_id VARCHAR(20)                    -- 그룹 ID
major VARCHAR(50)                       -- 대분류
minor VARCHAR(50)                       -- 중분류
view INT                                -- 정렬 순서
create_date DATETIME
```

#### 5. 관리자 관련

**`tb_notice` (공지사항)**

```sql
id INT PRIMARY KEY AUTO_INCREMENT
admin_id INT                            -- FK to tb_user
title VARCHAR(200)
content TEXT
create_date DATETIME
update_date DATETIME
delete_date DATETIME
```

### 주요 관계

- **User ↔ Shop**: 1:N (한 사용자가 여러 맛집 신청)
- **User ↔ Shop (Wishlist)**: N:M (다대다 찜 관계)
- **Shop ↔ Category**: N:M (한 맛집이 여러 카테고리 소속 가능)
- **User ↔ Board**: 1:N (한 사용자가 여러 게시글 작성)
- **Board ↔ Comment**: 1:N (한 게시글에 여러 댓글)

---

## 🎯 핵심 비즈니스 로직

### 1. 맛집 신청 및 승인 프로세스 (Approval System)

이 시스템의 가장 핵심적인 기능은 **사용자 참여형 데이터 구축과 품질 관리**입니다.

#### 📍 Phase 1: 사용자 신청

```
사용자 → [맛집 신청 페이지] → ApprovalController.createApproval()
```

**처리 흐름:**

1. 사용자가 로그인 후 `/approval/write` 페이지 접속
2. 맛집 정보 입력 (이름, 주소, 설명, 카테고리)
3. 이미지 업로드 (MultipartFile[])
4. `ApprovalService.createApproval()` 실행:
    - 새로운 Shop ID 생성 (`RS` + 10자리 시퀀스)
    - `tb_shop` 테이블에 INSERT (`req_type = NULL`)
    - `tb_shopdetail`에 카테고리 매핑 정보 INSERT
    - `tb_shopimg`에 이미지 정보 INSERT
    - 파일은 외부 디렉토리 (`${UPLOAD_ROOT}/approval/{id}/`)에 저장

**결과:** 맛집 신청 완료, 관리자 검토 대기 상태

#### 📍 Phase 2: 관리자 검토

```
관리자 → [관리자 페이지] → AdminController.shopList()
```

**처리 흐름:**

1. 관리자가 `/admin/shops?tab=pending` 접속
2. `AdminService.getShopList()` 실행:
   ```sql
   SELECT * FROM tb_shop 
   WHERE req_type IS NULL  -- 대기 중인 신청만 조회
   ORDER BY create_date DESC
   ```
3. 신청 목록을 페이징 처리하여 표시
4. 관리자가 각 신청 건의 상세 정보 검토:
    - 맛집 이름, 주소, 설명
    - 카테고리 적절성
    - 업로드된 이미지 품질

#### 📍 Phase 3: 승인/반려 처리

```
관리자 → [승인/반려 버튼] → AdminController.updateShopStatus()
```

**승인 시:**

```java
adminService.processShopApproval(id, "approve");
// SQL: UPDATE tb_shop SET req_type = 'Y' WHERE id = #{id}
```

- `req_type`이 `'Y'`로 변경
- **일반 사용자 검색 결과에 노출 시작**
- ShopMapper의 `searchConditions` 조건:
  ```sql
  WHERE COALESCE(s.req_type, '') = 'Y'  -- 승인된 맛집만 조회
  ```

**반려 시:**

```java
adminService.processShopApproval(id, "reject");
// SQL: UPDATE tb_shop SET req_type = 'N' WHERE id = #{id}
```

- `req_type`이 `'N'`으로 변경
- 일반 사용자 검색 결과에 노출되지 않음
- 신청자는 마이페이지에서 반려 상태 확인 가능

#### 📍 Phase 4: 결과 확인

```
사용자 → [마이페이지] → UserMyPageController.getMyRequestShopList()
```

**처리 흐름:**

1. 사용자가 `/user/api/my/reqShopList` 호출
2. 본인이 신청한 맛집 목록 조회:
   ```sql
   SELECT id, name, address, req_type, create_date
   FROM tb_shop
   WHERE user_id = #{userId}
   ORDER BY create_date DESC
   ```
3. 상태 표시:
    - `req_type = NULL` → "검토 중"
    - `req_type = 'Y'` → "승인 완료"
    - `req_type = 'N'` → "반려됨"

**핵심 포인트:**

- 신청(`NULL`) → 승인(`Y`) → 일반 검색 노출
- 반려(`N`)된 데이터는 보존되어 신청자가 확인 가능
- 관리자 승인을 통한 **데이터 품질 보장**

### 2. JWT 기반 인증 흐름

#### 로그인 프로세스

```
사용자 → UserController.userLocalLogin()
↓
1. 이메일/비밀번호 검증
2. Access Token 생성 (30분 유효)
3. Refresh Token 생성 (14일 유효)
4. Refresh Token을 DB에 저장 (tb_refreshtoken)
5. Access Token을 HttpOnly 쿠키로 전송
6. 응답 JSON에도 토큰 포함 (클라이언트 선택적 사용)
```

#### 인증 처리 (JwtAuthenticationFilter)

```
모든 요청 → JwtAuthenticationFilter.doFilterInternal()
↓
1. Authorization 헤더 또는 쿠키에서 Access Token 추출
2. JWT 검증 (서명, 만료 시간)
3. 블랙리스트 체크 (로그아웃된 토큰 차단)
4. 토큰에서 이메일 추출 → User 정보 로드
5. SecurityContext에 인증 정보 설정
```

#### 토큰 갱신 프로세스

```
클라이언트 → UserController.refresh()
↓
1. userId + Refresh Token 전달
2. DB에서 Refresh Token 조회 및 검증
3. 새로운 Access Token 발급
4. 기존 Refresh Token 유지 (재발급 안 함)
```

#### 로그아웃 프로세스

```
사용자 → UserController.logout()
↓
1. Access Token을 블랙리스트(tb_blacklist)에 추가
2. Refresh Token을 DB에서 삭제
3. Access Token 쿠키 만료 처리
```

### 3. 다중 필터 검색 (Dynamic Query)

**사용자 요구사항:** "돈코츠 라멘 + 도쿄 지역" 같은 복합 조건 검색

**처리 흐름:**

```
ShopController.filterShopList() → ShopService.allShopList()
↓
1. 요청 파라미터를 Map<String, List<String>>로 변환
   예: {"G001": ["C001", "C002"], "G002": ["C010"]}
   
2. MyBatis Dynamic SQL 생성:
   <foreach collection="conditions" index="groupId" item="idList">
       AND EXISTS (
           SELECT 1 FROM tb_shopdetail sd 
           WHERE sd.id = s.id 
           AND sd.contents IN ('C001', 'C002')
       )
   </foreach>
   
3. 각 그룹(카테고리 타입)별로 OR 조건, 그룹 간 AND 조건 적용
4. 찜 상태 LEFT JOIN 처리 (로그인 사용자만)
5. 페이징 적용 (LIMIT, OFFSET)
```

**SQL 예시:**

```sql
SELECT s.*,
       CASE WHEN uw.user_id IS NULL THEN FALSE ELSE TRUE END AS liked
FROM tb_shop s
WHERE s.req_type = 'Y'
  AND EXISTS (SELECT 1 FROM tb_shopdetail WHERE id = s.id AND contents IN ('C001', 'C002'))
  AND EXISTS (SELECT 1 FROM tb_shopdetail WHERE id = s.id AND contents = 'C010') LEFT JOIN tb_userwishlist uw
ON uw.shop_id = s.id AND uw.user_id = ?
ORDER BY s.id
LIMIT 8 OFFSET 0
```

### 4. 파일 업로드 및 보안

**파일 저장 전략:**

```
업로드 → ApprovalService.createApproval() / BoardService.writeBoard()
↓
1. UUID 생성으로 파일명 중복 방지
2. 외부 디렉토리 저장 (${UPLOAD_ROOT}/approval/{id}/ 또는 board/{id}/)
3. DB에는 상대 경로만 저장 (file_addr)
4. 파일 크기 검증 (5MB/파일, 20MB/요청)
```

**파일 다운로드 보안:**

```
BoardController.readBoardFile()
↓
1. DB에서 파일 정보 조회 (boardId + fileSeq로만 접근)
2. 저장된 경로(storageKey) 검증
3. Path Traversal 방지:
   if (!target.startsWith(root)) {
       throw new ResponseStatusException(BAD_REQUEST);
   }
4. 파일 존재 여부 확인
5. Content-Type 설정 후 전송
```

---

## 📡 API 명세

### 사용자 인증

| Method | Endpoint                | 설명                | 권한            |
|--------|-------------------------|-------------------|---------------|
| POST   | `/user/LocalSignup`     | 일반 회원가입           | Public        |
| POST   | `/user/LocalSignin`     | 일반 로그인 (JWT 발급)   | Public        |
| POST   | `/user/refresh`         | Access Token 갱신   | Public        |
| POST   | `/user/logout`          | 로그아웃 (토큰 무효화)     | Authenticated |
| GET    | `/user/me`              | 내 정보 조회           | Authenticated |
| GET    | `/user/check-duplicate` | 아이디/이메일/닉네임 중복 체크 | Public        |

### 맛집 검색 및 조회

| Method | Endpoint              | 설명                | 권한            |
|--------|-----------------------|-------------------|---------------|
| GET    | `/shop`               | 맛집 목록 조회 (초기 페이지) | Public        |
| GET    | `/shop/filter`        | 필터링된 맛집 목록 (AJAX) | Public        |
| GET    | `/shop/{id}`          | 맛집 상세 정보          | Public        |
| POST   | `/shop/{id}/wishlist` | 찜 토글              | Authenticated |

### 맛집 신청

| Method | Endpoint                    | 설명             | 권한            |
|--------|-----------------------------|----------------|---------------|
| GET    | `/api/approval/list`        | 신청 목록 조회 (페이징) | Public        |
| GET    | `/api/approval/detail/{id}` | 신청 상세 조회       | Public        |
| POST   | `/api/approval`             | 맛집 신청 생성       | Authenticated |
| PUT    | `/api/approval/{id}`        | 맛집 신청 수정       | Owner Only    |
| DELETE | `/api/approval/delete/{id}` | 맛집 신청 삭제       | Owner Only    |
| GET    | `/api/approval/owner/{id}`  | 작성자 여부 확인      | Authenticated |

### 마이페이지

| Method | Endpoint                   | 설명         | 권한            |
|--------|----------------------------|------------|---------------|
| GET    | `/user/api/my/board`       | 내 게시글 목록   | Authenticated |
| POST   | `/user/api/my/update`      | 내 정보 수정    | Authenticated |
| GET    | `/user/api/my/wishlist`    | 내 찜 목록     | Authenticated |
| DELETE | `/user/api/my/wishlist`    | 찜 삭제       | Authenticated |
| GET    | `/user/api/my/reqShopList` | 내 신청 맛집 목록 | Authenticated |

### 게시판

| Method | Endpoint                         | 설명        | 권한            |
|--------|----------------------------------|-----------|---------------|
| GET    | `/api/board/list`                | 게시글 목록    | Public        |
| GET    | `/api/board/detail/{id}`         | 게시글 상세    | Public        |
| POST   | `/api/board/write`               | 게시글 작성    | Authenticated |
| POST   | `/api/board/update`              | 게시글 수정    | Owner Only    |
| DELETE | `/api/board/delete/{id}`         | 게시글 삭제    | Owner Only    |
| GET    | `/api/board/file/{id}/{fileSeq}` | 첨부파일 다운로드 | Public        |
| POST   | `/api/board/comment/write`       | 댓글 작성     | Authenticated |
| GET    | `/api/board/comment/list/{id}`   | 댓글 목록     | Public        |

### 관리자

| Method | Endpoint                       | 설명                | 권한    |
|--------|--------------------------------|-------------------|-------|
| GET    | `/admin/users`                 | 회원 목록 조회          | Admin |
| POST   | `/admin/users/{userId}/status` | 회원 상태 변경          | Admin |
| GET    | `/admin/notices`               | 공지사항 목록           | Admin |
| POST   | `/admin/notices/add`           | 공지사항 작성           | Admin |
| POST   | `/admin/notices/update`        | 공지사항 수정           | Admin |
| GET    | `/admin/categories`            | 카테고리 관리 페이지       | Admin |
| GET    | `/admin/categories/items`      | 카테고리 상세 목록 (AJAX) | Admin |
| POST   | `/admin/categories/save`       | 카테고리 저장           | Admin |
| POST   | `/admin/categories/delete`     | 카테고리 삭제           | Admin |
| GET    | `/admin/shops`                 | 맛집 신청 관리 목록       | Admin |
| POST   | `/admin/shops/status`          | 맛집 승인/반려 처리       | Admin |

---

## 🔐 보안 및 인증

### 1. Spring Security 설정

```java

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    // Stateless Session (JWT 사용)
    .

    sessionManagement(session ->session
            .sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // 권한별 엔드포인트 접근 제어
            .

    authorizeHttpRequests(auth ->auth
            .requestMatchers("/admin/**").

    hasAuthority("ADMIN")
        .

    requestMatchers("/user/api/my/**").

    authenticated()
        .

    requestMatchers("/api/approval/**").

    permitAll()  // GET은 Public
        ...)
}
```

### 2. 인증 방식

- **JWT (JSON Web Token)**
    - Access Token: 30분 유효 (짧은 유효기간으로 탈취 위험 최소화)
    - Refresh Token: 14일 유효 (DB 저장으로 강제 무효화 가능)
    - 알고리즘: HS256
    - 쿠키 저장: HttpOnly, SameSite=Lax

### 3. 비밀번호 암호화

- **BCrypt** 사용 (Spring Security 기본 제공)
- Salt 자동 생성 및 관리
- 단방향 해시 (복호화 불가)

### 4. 보안 조치

| 위협                 | 대응 방안                                        |
|--------------------|----------------------------------------------|
| **SQL Injection**  | MyBatis PreparedStatement 사용 (#{} 바인딩)       |
| **CSRF**           | Stateless JWT 사용으로 CSRF 보호 비활성화              |
| **XSS**            | Thymeleaf 자동 이스케이핑, 입력 검증                    |
| **Path Traversal** | 파일 다운로드 시 경로 검증 (`!target.startsWith(root)`) |
| **토큰 탈취**          | 짧은 Access Token 유효기간, Refresh Token DB 관리    |
| **무차별 대입 공격**      | (추가 권장) 로그인 시도 횟수 제한 로직                      |

### 5. 권한 계층

```
ADMIN > USER
```

- **USER**: 일반 사용자 권한 (맛집 검색, 신청, 게시글 작성)
- **ADMIN**: 관리자 권한 (회원 관리, 맛집 승인, 카테고리 관리)

---

## 🚀 설치 및 실행

### 필수 요구 사항

- **JDK 21** 이상
- **MySQL 8.0** 이상
- **Gradle** (Wrapper 포함)

### 1. 데이터베이스 설정

```sql
-- 데이터베이스 생성
CREATE DATABASE rapid CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- 사용자 생성 및 권한 부여 (선택)
CREATE USER 'rapid_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON rapid.* TO 'rapid_user'@'localhost';
FLUSH PRIVILEGES;
```

### 2. 환경 설정 파일

예시 파일을 복사하여 실제 설정 파일을 생성합니다:

```bash
# secret.properties 생성
cp src/main/resources/secret.properties.example src/main/resources/secret.properties

# application.yaml 확인 (이미 존재하면 수정)
cp src/main/resources/application.yaml.example src/main/resources/application.yaml
```

`src/main/resources/secret.properties` 파일을 열고 실제 값으로 수정합니다:

```properties
# Database
db.username=your_mysql_username
db.password=your_mysql_password
# JWT
jwt.secret=your-secret-key-at-least-256-bits-long-for-hs256-algorithm
# OAuth2 (Google)
google.client-id=your-google-client-id
google.client-secret=your-google-client-secret
google.redirect-uri=http://localhost:8080/login/oauth2/code/google
```

**주의:** `secret.properties`는 `.gitignore`에 추가하여 버전 관리에서 제외해야 합니다.

### 3. 애플리케이션 설정 (`application.yaml`)

```yaml
spring:
  datasource:
    url: jdbc:log4jdbc:mysql://localhost:3306/rapid?serverTimezone=UTC&useUnicode=true&characterEncoding=utf-8
    username: ${db.username}
    password: ${db.password}

  servlet:
    multipart:
      max-file-size: 5MB
      max-request-size: 20MB

app:
  upload:
    root: ${UPLOAD_ROOT:${user.home}/rapid-uploads}  # 파일 업로드 경로
```

### 4. 빌드 및 실행

```bash
# 프로젝트 클론
git clone <repository-url>
cd rapid

# 빌드
./gradlew clean build

# 실행
./gradlew bootRun

# 또는 JAR 파일로 실행
java -jar build/libs/rapid-0.0.1-SNAPSHOT.jar
```

### 5. 접속

- **메인 페이지**: http://localhost:8080
- **로그인 페이지**: http://localhost:8080/login
- **관리자 페이지**: http://localhost:8080/admin (ADMIN 권한 필요)

### 6. 초기 관리자 계정 생성

데이터베이스에 직접 관리자 계정을 생성합니다:

```sql
-- BCrypt로 암호화된 "admin1234" 비밀번호
INSERT INTO tb_user (id, password, nickname, name, email, role, create_date)
VALUES ('admin',
        '$2a$10$X3g1oWrYQbQ3IB3gKQIw3O1xr7vvZf8fW.k/1vGd7g7.mZ0MwmX9K', -- admin1234
        '관리자',
        'Admin',
        'admin@rapid.com',
        'ADMIN',
        NOW());
```

---

## 📌 프로젝트 구조

```
rapid/
├── src/main/java/com/binary/rapid/
│   ├── admin/              # 관리자 기능
│   │   ├── controller/
│   │   ├── service/
│   │   ├── mapper/
│   │   └── dto/
│   ├── approval/           # 맛집 신청 기능
│   ├── board/              # 게시판 기능
│   ├── category/           # 카테고리 관리
│   ├── shop/               # 맛집 검색 및 조회
│   ├── user/               # 사용자 인증/인가
│   │   ├── config/         # Spring Security 설정
│   │   ├── global/         # JWT, 필터
│   │   └── handler/        # OAuth2, 예외 처리
│   └── RapidApplication.java
├── src/main/resources/
│   ├── mapper/             # MyBatis XML
│   ├── static/             # CSS, JS, 이미지
│   ├── templates/          # Thymeleaf 템플릿
│   ├── application.yaml
│   └── secret.properties   # 보안 정보 (git 제외)
└── build.gradle
```

---

## 📝 개발 히스토리 및 개선 사항

### 구현된 핵심 기능

✅ JWT 기반 Stateless 인증 시스템  
✅ 사용자 참여형 맛집 등록 및 관리자 승인 프로세스  
✅ 다중 필터 동적 검색 (MyBatis Dynamic SQL)  
✅ 찜 기능 (N:M 관계)  
✅ 파일 업로드 및 안전한 다운로드  
✅ 커뮤니티 게시판 (CRUD, 댓글, 첨부파일)  
✅ 관리자 페이지 (회원/맛집/공지/카테고리 관리)  
✅ OAuth2 소셜 로그인 (Google)  
✅ 권한 기반 접근 제어 (ADMIN/USER)

### 향후 개선 가능 사항

🔧 Redis를 활용한 토큰 블랙리스트 관리 (성능 개선)  
🔧 Elasticsearch 도입 (전문 검색 기능 강화)  
🔧 이미지 리사이징 및 CDN 연동  
🔧 맛집 평점 및 리뷰 시스템  
🔧 실시간 알림 (SSE 또는 WebSocket)  
🔧 API 문서 자동화 (Swagger/SpringDoc)  
🔧 단위/통합 테스트 커버리지 확대  
🔧 Docker 컨테이너화 및 CI/CD 파이프라인 구축

---

## 👨‍💻 개발자 정보

- **프로젝트명**: Rapid
- **개발 기간**: [프로젝트 기간 입력]
- **개발 인원**: [팀 구성 입력]
- **담당 역할**: [본인 역할 입력]

---

## 📄 라이선스

This project is licensed under the MIT License.
