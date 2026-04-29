# HUONG DAN CHAY DU AN DORMHUB

Lam theo tung buoc ben duoi tren Windows.

## 1. Cai PostgreSQL

Neu may chua co PostgreSQL thi cai truoc.

Sau khi cai xong, can biet:

```text
Username PostgreSQL
Password PostgreSQL
```

Port mac dinh thuong la:

```text
5432
```

## 2. Restore database

Neu trong source co file `newbackup` thi mo PowerShell tai thu muc goc cua du an va chay:

```powershell
$env:PGPASSWORD="MAT_KHAU_POSTGRES"
pg_restore -U postgres -h localhost -p 5432 -C -d postgres .\newbackup
```

Neu username PostgreSQL cua may khong phai `postgres` thi doi lai cho dung.

Lenh nay se restore ra database:

```text
dorm_db
```

Neu may khong nhan `pg_restore` thi restore bang pgAdmin cung duoc.

## 3. Chinh file backend/.env

Mo file `backend/.env` va sua cho dung voi may:

```env
FLASK_APP=run.py
FLASK_ENV=development
PORT=5000
DATABASE_URL=postgresql://postgres:123456@localhost:5432/dorm_db
JWT_SECRET_KEY=super-secret-key-for-dormitory-project
```

Neu username/password PostgreSQL khac thi chi can sua dong nay:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/dorm_db
```

Vi du:

```env
DATABASE_URL=postgresql://myuser:mypassword@localhost:5432/dorm_db
```

## 4. Chay backend

Mo Terminal 1 tai thu muc du an va chay:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
flask db upgrade
python run.py
```

Backend chay o:

```text
http://127.0.0.1:5000
```

Luu y:

```text
http://127.0.0.1:5000
```

bao `Not Found` la binh thuong, vi backend nay la API, khong phai trang giao dien.

## 5. Chay frontend

Mo Terminal 2 tai thu muc du an va chay:

```powershell
cd frontend
npm install
npm run dev
```

Frontend chay o:

```text
http://127.0.0.1:5173
```

Mo link nay tren trinh duyet de dung he thong.

## 6. Tai khoan test

Dang nhap bang cac tai khoan sau:

```text
Admin:   admin / admin123
Staff:   staff1 / 123456
Student: student1 / 123456
```

## 7. Cac chuc nang da hoan thien

Du an hien da co:

```text
Dang nhap 3 role admin / staff / student
Quan ly sinh vien
Quan ly phong
Chia phong nam / nu
Gui yeu cau thue phong va duyet hop dong
Quan ly maintenance
Announcements / events
Chuông thong bao cho cac role
Bills / payment history
Thanh toan MoMo sandbox
Responsive cac man hinh chinh
```

## 8. Luu y quan trong

Khong chay lenh nay neu khong muon xoa va tao lai user:

```powershell
python reset_users.py
```
