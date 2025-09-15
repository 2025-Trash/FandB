Here's the `README.md` file formatted for direct copy and paste into GitHub. It's the same content you provided, structured with appropriate headings, code blocks, and formatting.

````markdown
# FandB (Frontend + Backend Monorepo)

React 프론트엔드와 Django 백엔드를 통합 관리하는 저장소입니다.

---

## 📂 프로젝트 구조

```bash
/backend      # Django + Django REST Framework
/frontend     # React (Create React App 기반)
```
````

---

## ⚙️ Backend (Django)

### 1\. 환경 준비

- Python 3.10 이상 권장
- 가상환경 사용 권장

<!-- end list -->

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt   # 파일명이 requiremets.txt일 수도 있음
```

### 2\. DB 마이그레이션

```bash
python manage.py makemigrations
python manage.py migrate
```

### 3\. 서버 실행

```bash
# 로컬에서 실행
python manage.py runserver 8000

# 외부 기기 접속도 허용하려면
python manage.py runserver 0.0.0.0:8000
```

### 4\. 관리자 계정 (선택)

```bash
python manage.py createsuperuser
```

### 5\. CORS/CSRF 설정 (`settings.py`)

```python
INSTALLED_APPS += ["corsheaders", "rest_framework"]
MIDDLEWARE = ["corsheaders.middleware.CorsMiddleware", *MIDDLEWARE]

ALLOWED_HOSTS = ["*"]
CORS_ALLOWED_ORIGINS = ["http://localhost:3000"]
CSRF_TRUSTED_ORIGINS = ["http://localhost:3000"]
CORS_ALLOW_CREDENTIALS = True
```

---

## 🎨 Frontend (React)

### 1\. 환경 준비

- Node.js 18 이상 권장
- npm 또는 yarn 사용 가능

<!-- end list -->

```bash
cd frontend
npm install
```

### 2\. 환경변수 설정

`.env.local` 파일 생성:

```bash
REACT_APP_API_BASE=http://localhost:8000
```

### 3\. 실행

```bash
npm start
```

브라우저에서 `http://localhost:3000` 접속 후 확인합니다.

---

## 🚑 Trouble Shooting

- **Failed to fetch**

  - 백엔드 서버 실행 여부 확인 (`runserver`)
  - `.env.local`에 API 주소 올바른지 확인
  - CORS/CSRF 설정 누락 여부 확인

- **403 CSRF**

  - `settings.py` → `CSRF_TRUSTED_ORIGINS` 설정 확인
  - 프론트 fetch 요청에 `credentials: 'include'` 추가

---

## 📌 배포 계획 (추가 예정)

- Backend: Django + Gunicorn + Nginx
- Frontend: Static build (`npm run build`) + Nginx

---

## 🏷️ 버전 태그

- v1: 첫 통합 버전 (frontend + backend)

<!-- end list -->

```

```
