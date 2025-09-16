# NestJS 백엔드 프로젝트

NestJS 10과 PostgreSQL을 기반으로 한 백엔드 서버 프로젝트입니다.  
패키지 관리는 **pnpm**을 사용합니다.

---

## 🛠️ pnpm 사용법

```bash
# 패키지 설치
pnpm install

# 개발 서버 실행
pnpm start:dev

# 코드 빌드
pnpm build

# 프로덕션 실행
pnpm start
```

---

## 📁 폴더 구조

```
src/
├── common/
│   ├── decorators/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   ├── logging/
│   ├── middleware/
│   ├── pipes/
│   ├── redis/
│   ├── swagger/
├── config/
├── modules/
├── types/
├── utils/
├── app.controller.ts
├── app.module.ts
├── app.service.ts
└── main.ts
```

---

## 📂 폴더/파일 설명
| 경로                        | 설명                           |
|---------------------------|------------------------------|
| `common/`                 | 공통 코드(데코레이터, 미들웨어, 필터, 가드 등) |
| `common/decorators/`      | 커스텀 데코레이터 모음                 |
| `common/enum/`            | 공통 Enum 타입 정의 모음              |
| `common/filters/`         | 예외 필터                        |
| `common/guards/`          | 인증/인가 가드                     |
| `common/interceptors/`    | 인터셉터                         |
| `common/logging/`         | 로깅 관련 코드                     |
| `common/middleware/`      | 커스텀 미들웨어                     |
| `common/pipes/`           | 커스텀 파이프(변환, 검증)              |
| `common/redis/`           | Redis 관련 유틸리티                |
| `common/swagger/`         | Swagger(OpenAPI) 문서화 설정      |
| `config/`                 | 환경설정, DB 설정 등 각종 설정 파일       |
| `modules/`                | 주요 도메인별(비즈니스 로직 단위) 모듈       |
| `modules/xxx/dto/`        | DTO                          |
| `modules/xxx/interfaces/` | 인터페이스                        |
| `modules/xxx/entity/`     | 엔티티                          |
| `modules/auth/`           | 인증/인가 관련 모듈                  |
| `modules/user/`           | 유저(회원) 관련 모듈                 |
| `types/`                  | 전역 타입 선언 파일                  |
| `utils/`                  | 공통 함수, 유틸리티                  |
| `app.controller.ts`       | 앱 루트 컨트롤러                    |
| `app.module.ts`           | 앱 루트 모듈                      |
| `app.service.ts`          | 앱 루트 서비스                     |
| `main.ts`                 | 애플리케이션 엔트리 포인트(시작점)          |

---


## 📌 참고 사항

- 환경 변수 파일(`.env`) 및 중요한 정보는 루트 경로에서 별도로 관리합니다.
- 새로운 도메인(예: product, order 등)은 `modules/` 폴더 하위에 모듈 추가만 하면 됩니다.
- 공통 코드, 미들웨어, 유틸 등은 `common/` 또는 `utils/` 폴더에서 관리합니다.
- NestJS 공식 문서: https://docs.nestjs.com/
- PostgreSQL 공식 문서: https://www.postgresql.org/docs/

---

> 폴더/파일 구조 및 설명은 프로젝트의 필요에 따라 자유롭게 추가·수정할 수 있습니다.

---

## 🧑‍💻 코딩 컨벤션 (기본 세팅)

### 1. 네이밍 규칙
- **클래스/인터페이스/타입:** `PascalCase`
    - 예시: `UserService`, `JwtPayload`
- **함수/메서드/변수:** `camelCase`
    - 예시: `getUserProfile`, `userId`
- **상수:** `UPPER_SNAKE_CASE`
    - 예시: `MAX_LOGIN_ATTEMPT`
- **DB 테이블/컬럼:** `snake_case` (PostgreSQL 규칙 참고)

### 2. 파일/폴더 구조
- **파일명/폴더명:** `kebab-case` (권장, 소문자+하이픈)
    - 예시: `user-profile.service.ts`, `user-profile.controller.ts`

### 3. TypeScript 스타일
- **타입/인터페이스 명시 필수**
- **함수 리턴 타입 명시 필수**
- **`any` 사용 금지 (정말 불가피할 때만 예외)**
- **Optional 파라미터/필드에는 `?` 사용**

### 4. 코드 스타일
- **세미콜론(;) 필수**
- **탭 대신 스페이스 2 or 4 (팀 규칙에 맞춰 통일)**
- **ESLint, Prettier로 자동 포맷팅**
- **import 순서: node > 외부 > 내부(alias) > 상대경로**
- **공백 라인/불필요한 주석 최소화**

### 5. 커밋/브랜치 네이밍
- **커밋 메시지:** `[타입] 요약 (필요시 #이슈번호)`
    - 타입: feat, fix, docs, refactor, style, test, chore 등
    - 예시: `feat: 회원가입 API 구현 (#12)`
- **브랜치 명:** `feature/login-api`, `fix/user-profile-bug` 등

### 6. 기타
- **공통/반복 코드 유틸 함수로 분리**
- **공통 타입, 상수, DTO, 인터페이스 등 별도 폴더 관리**
- **에러 처리: NestJS Exception 및 핸들러 활용**
- **DTO, Entity, Interface 네이밍 일관성 유지**
- **한글 주석은 꼭 필요한 경우만 최소한으로**

---

### 🛠️ 자동화 도구 (권장)

- **ESLint:** 코드 린트 체크
- **Prettier:** 코드 포맷 일관성

---

## 🐘 PostgreSQL 테이블 설계 가이드 & 네이밍 컨벤션

### 1. 테이블명

* **스네이크 케이스(snake\_case)** 사용
  예시: `users`, `user_profiles`, `order_items`
* **복수형** 사용을 권장 (팀마다 단수형/복수형 혼용 가능, 반드시 통일!)

### 2. 컬럼명

* **스네이크 케이스**
  예시: `user_id`, `created_at`, `updated_at`, `is_active`
* **불린 컬럼**: `is_`, `has_` 접두어 (ex: `is_active`)
* **명확한 의미의 접미사/접두사**

    * PK/FK: `*_id`
    * 날짜/시간: `*_at`
    * 카운트: `*_cnt`
    * 타입/상태: `*_type`, `*_status` 등

### 3. 기본키/시퀀스

* `id SERIAL PRIMARY KEY` 또는 `id BIGSERIAL PRIMARY KEY`
* 대용량 서비스나 uuid가 필요하면
  `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`

### 4. 외래키(FK)

* 컬럼명: `user_id`, `order_id`
* 반드시 인덱스와 제약조건 추가

  ```sql
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id)
  ```

### 5. 타임스탬프 컬럼

* `created_at TIMESTAMP DEFAULT now() NOT NULL`
* `updated_at TIMESTAMP DEFAULT now() NOT NULL`
* 소프트딜리트: `deleted_at TIMESTAMP NULL`

### 6. 코멘트(주석)

* 모든 테이블/컬럼에 코멘트 적극 활용

  ```sql
  COMMENT ON TABLE users IS '유저(회원) 테이블';
  COMMENT ON COLUMN users.created_at IS '생성일시';
  ```

### 7. 인덱스

* FK, 자주 조회/정렬되는 컬럼에 인덱스 추가

  ```sql
  CREATE INDEX idx_user_email ON users(email);
  ```

### 8. ENUM 타입

* PostgreSQL ENUM TYPE 적극 활용

  ```sql
  CREATE TYPE user_status AS ENUM ('active', 'suspended', 'withdrawn');
  -- 컬럼 선언
  status user_status DEFAULT 'active'
  ```

### 9. 관계(조인)

* 1\:N, N:1: FK 사용
* N\:M: 조인 테이블 생성 (ex: `user_roles`)

---

### 📋 실전 CREATE TABLE 예시

```sql
CREATE TABLE users (
  id              BIGSERIAL PRIMARY KEY,
  email           VARCHAR(255) NOT NULL UNIQUE,
  password        VARCHAR(255) NOT NULL,
  name            VARCHAR(50) NOT NULL,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMP DEFAULT now() NOT NULL,
  updated_at      TIMESTAMP DEFAULT now() NOT NULL
);

COMMENT ON TABLE users IS '유저(회원) 테이블';
COMMENT ON COLUMN users.email IS '이메일(로그인 ID)';
COMMENT ON COLUMN users.created_at IS '생성일시';
```

---

**실무에서는 일관된 네이밍과 코멘트, 인덱스 관리를 통해 가독성과 유지보수성을 높입니다.**

---

## 🛑 HTTP 예외 처리 가이드

| 예외 클래스                               |  코드 | 의미               | 대표 사용 상황                    |
| ------------------------------------ | --: | ---------------- | --------------------------- |
| `BadRequestException`                | 400 | 요청 형식/값 오류       | DTO 유효성 실패, 필수 값 누락, 잘못된 형식 |
| `UnauthorizedException`              | 401 | **인증 실패**        | 토큰 없음·만료·서명 불일치, 로그인 필요     |
| `ForbiddenException`                 | 403 | **인가 실패**        | 인증은 됐으나 권한 없음(ROLE 부족)      |
| `NotFoundException`                  | 404 | 리소스 없음           | ID로 조회했으나 존재하지 않음           |
| `MethodNotAllowedException`          | 405 | 메서드 불가           | 경로는 맞으나 해당 HTTP 메서드 미허용     |
| `NotAcceptableException`             | 406 | 콘텐츠 협상 실패        | `Accept` 헤더와 응답 타입 불일치      |
| `RequestTimeoutException`            | 408 | 요청 시간 초과         | 비즈니스 타임아웃 표현                |
| `ConflictException`                  | 409 | 리소스 상태 충돌        | 유니크 제약 위반, 중복 생성, 버전 충돌     |
| `GoneException`                      | 410 | 영구 삭제            | 과거 존재했으나 영구 제거              |
| `PreconditionFailedException`        | 412 | 전제조건 실패          | If-Match/ETag 등 동시성 제어 실패   |
| `PayloadTooLargeException`           | 413 | 요청 본문 과대         | 업로드 용량 초과                   |
| `UnsupportedMediaTypeException`      | 415 | 미지원 Content-Type | `application/json` 아닌 전송 등  |
| `UnprocessableEntityException`       | 422 | 의미 검증 실패         | 비즈니스 규칙 불만족(형식은 OK)         |
| `ImATeapotException`                 | 418 | 이스터에그            | 실제 서비스에선 거의 사용 안 함          |
| `InternalServerErrorException`       | 500 | 서버 내부 오류         | 예기치 못한 예외                   |
| `NotImplementedException`            | 501 | 미구현              | 스펙만 있고 아직 구현 전              |
| `BadGatewayException`                | 502 | 업스트림 오류          | 게이트웨이/프록시 상류 응답 오류          |
| `ServiceUnavailableException`        | 503 | 일시적 불가           | 과부하/점검, 재시도 가능              |
| `GatewayTimeoutException`            | 504 | 업스트림 타임아웃        | 상류 응답 지연                    |
| `HttpVersionNotSupportedException`   | 505 | HTTP 버전 미지원      | 매우 드묾                       |


