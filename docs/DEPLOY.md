# Deploy: backend lên Azure, frontend lên Vercel

Kiến trúc sau khi deploy:

```
Trình duyệt ──► Vercel (React, client/)  ──fetch──►  Azure App Service (API, server/)
               https://<project>.vercel.app          https://<app>.azurewebsites.net/api/...
```

Làm theo đúng thứ tự: **đẩy code lên GitHub → backend → frontend → quay lại mở CORS cho domain Vercel.**
Frontend cần URL của backend, còn backend cần domain của frontend, nên phải đi vòng như vậy.

---

## 0. Đẩy code lên GitHub

Cả Vercel lẫn GitHub Actions (để deploy lên Azure) đều lấy code từ GitHub.

1. Tạo repo trống trên github.com (không tick README hay .gitignore).
2. Trong thư mục dự án:

   ```bash
   git remote add origin https://github.com/<tên-bạn>/<tên-repo>.git
   git push -u origin main
   ```

File `supabase password` đã nằm trong `.gitignore` nên không bị đẩy lên. Trước khi push, kiểm tra lại bằng
`git ls-files | grep -i supabase`: lệnh này phải không in ra gì.

---

## 1. Backend lên Azure App Service

Cách này chạy thẳng code .NET, không cần Docker hay Container Registry, và dùng được gói **Free (F1)**.

### 1.1 Tạo Web App

Vào portal.azure.com → **Create a resource** → **Web App**:

| Ô | Chọn |
| --- | --- |
| Resource group | Tạo mới, ví dụ `fat-guide` |
| Name | ví dụ `fat-guide-api` (phải là tên chưa ai dùng) |
| Publish | **Code** |
| Runtime stack | **.NET 8 (LTS)** |
| Operating System | **Linux** |
| Region | Southeast Asia (gần Việt Nam nhất) |
| Pricing plan | **Free F1** |

Bấm **Review + create** → **Create**. Xong thì mở Web App, ở trang **Overview** copy **Default domain**
(dạng `fat-guide-api....azurewebsites.net`). Từ đây gọi nó là `<AZURE_URL>`.

### 1.2 Cho phép tải publish profile

Vào **Settings → Configuration → General settings**, bật **SCM Basic Auth Publishing Credentials** → **Save**.
Không bật thì nút tải publish profile ở bước sau bị mờ.

### 1.3 Nối GitHub Actions

1. Ở trang **Overview** của Web App, bấm **Download publish profile**. Bạn được một file `.PublishSettings`.
2. Trên GitHub: repo → **Settings → Secrets and variables → Actions → New repository secret**:
   - Name: `AZURE_WEBAPP_PUBLISH_PROFILE`
   - Secret: dán **toàn bộ nội dung** file `.PublishSettings`.
3. Mở `.github/workflows/deploy-api.yml`, sửa dòng `AZURE_WEBAPP_NAME: fat-guide-api` thành đúng tên Web App
   của bạn, rồi commit và push.

Mỗi lần push thay đổi trong `server/`, workflow tự chạy: chạy test, `dotnet publish`, rồi deploy lên Azure.
Muốn chạy tay thì vào tab **Actions → Deploy API to Azure → Run workflow**.

### 1.4 Kiểm tra backend

Mở `https://<AZURE_URL>/api/health`. Kết quả đúng:

```json
{"status":"ok","hexDumps":6}
```

Lần đầu có thể mất 20–30 giây vì app phải khởi động.

---

## 2. Frontend lên Vercel

1. vercel.com → **Add New… → Project** → **Import** repo GitHub vừa tạo.
2. **Root Directory**: bấm **Edit**, chọn **`client`**. Đây là bước hay bị quên nhất.
3. Framework Preset tự nhận **Vite** (cấu hình nằm trong `client/vercel.json`).
4. **Environment Variables**:
   - Name: `VITE_API_BASE_URL`
   - Value: `https://<AZURE_URL>` (không có `/` ở cuối, không có `/api`)
5. Bấm **Deploy**. Xong thì copy domain chính, dạng `https://<project>.vercel.app`. Từ đây gọi nó là
   `<VERCEL_URL>`.

`VITE_API_BASE_URL` được gắn vào code **lúc build**. Sau này đổi giá trị thì phải vào **Deployments → … →
Redeploy** thì mới có hiệu lực.

---

## 3. Mở CORS cho domain Vercel

Lúc này mở `<VERCEL_URL>`, các hex dump sẽ báo **“Chưa tải được”**. Lý do: backend chưa cho phép domain
Vercel gọi tới. Bước này sửa lỗi đó.

Azure portal → Web App → **Settings → Environment variables → App settings → Add**:

| Name | Value |
| --- | --- |
| `Cors__AllowedOrigins__0` | `https://<project>.vercel.app` |

Bấm **Apply → Confirm**, app sẽ tự khởi động lại. Tải lại trang Vercel: các hex dump hiện ra là xong.

- Tên biến có **2 dấu gạch dưới** (`__`). ASP.NET đọc nó thành `Cors:AllowedOrigins[0]` trong `appsettings.json`.
- Giá trị phải **khớp chính xác**: có `https://`, không có `/` ở cuối.
- Có thêm domain (domain riêng, link preview của Vercel) thì thêm `Cors__AllowedOrigins__1`, `__2`…

---

## Lỗi thường gặp

| Triệu chứng | Nguyên nhân | Cách sửa |
| --- | --- | --- |
| Hex dump báo “Chưa tải được (Failed to fetch)”; Console có chữ `CORS` | Chưa làm bước 3, hoặc domain gõ sai hay thừa `/` cuối | Sửa `Cors__AllowedOrigins__0` cho khớp chính xác domain Vercel |
| Báo “Chưa tải được (HTTP 404)” | `VITE_API_BASE_URL` sai, ví dụ có thêm `/api` | Sửa biến trên Vercel rồi **Redeploy** |
| Vercel build lỗi “Could not read package.json” | Root Directory chưa đặt là `client` | Project Settings → General → Root Directory = `client` |
| Workflow lỗi ở bước `webapps-deploy` | Sai tên app hoặc thiếu secret publish profile | Kiểm tra `AZURE_WEBAPP_NAME` và secret `AZURE_WEBAPP_PUBLISH_PROFILE` |
| Nút Download publish profile bị mờ | Chưa bật SCM Basic Auth | Làm lại bước 1.2 |
| Lần đầu mở trang rất chậm, rồi lại chạy bình thường | Gói F1 cho app “ngủ” khi không ai dùng | Bình thường. Trang có nút **Thử lại**. Muốn hết hẳn thì lên gói B1 và bật **Always On** |
| `/swagger` trên Azure ra 404 | Swagger chỉ bật ở môi trường Development | Cố ý như vậy; ở máy local vẫn mở `/swagger` được |

---

## Cách khác: chạy backend bằng Docker trên Azure

`server/Dockerfile` vẫn dùng được nếu bạn muốn chạy bằng container (ví dụ Azure Container Apps).
Cách này cần Azure Container Registry để chứa image, và registry **tính phí theo tháng**, khác với gói F1 ở
trên. Image lắng nghe ở cổng **8080**, nên khi cấu hình ingress hay target port thì đặt là `8080`. Biến
`Cors__AllowedOrigins__0` đặt giống bước 3.
