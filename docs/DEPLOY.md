# Deploy: backend lên Azure VM, frontend lên Vercel

Sau khi làm xong, mỗi lần push lên `main` thì cả hai **tự động deploy**:

```
push lên main ─┬─► GitHub Actions: chạy test → build Docker image → đẩy lên GHCR → SSH vào VM → khởi động lại
               └─► Vercel: tự build và deploy frontend

Trình duyệt ──► https://<project>.vercel.app ──fetch──► https://<API_DOMAIN>/api/...
                                                        (VM: Caddy lo HTTPS → container API)
```

Vì sao cần Caddy và một domain: trang Vercel chạy `https://`, mà trình duyệt **chặn** trang `https` gọi tới
API `http://<IP>` (lỗi *mixed content*). Caddy tự xin và tự gia hạn chứng chỉ HTTPS miễn phí, nhưng cần một
tên miền trỏ về VM. Azure cho tên miền miễn phí dạng `<tên>.<vùng>.cloudapp.azure.com`.

Làm theo thứ tự dưới đây. Mỗi bước chỉ làm **một lần**.

---

## 1. Azure: mở cổng và đặt tên miền cho VM

**Gắn Public IP (nếu chưa có).** Ở trang Overview của VM, nếu **Public IP address** là `-` thì VM chưa có IP
công khai: không SSH được, GitHub Actions cũng không vào được. Cách gắn:

1. VM → **Networking → Network settings** → bấm vào tên **Network interface** (dạng `fat123_z1`).
2. Trong trang network interface: **Settings → IP configurations** → bấm `ipconfig1`.
3. Tick **Associate public IP address** → **Create a public IP address** → Name `FAT-ip`, Assignment
   **Static** → **OK** → **Save**.

Public IP có tính một khoản phí nhỏ mỗi tháng, trừ vào credit của Azure for Students.

**Mở cổng 80 và 443.** Portal → VM → **Networking** (Network settings) → **Add inbound port rule**:

| Ô | Giá trị |
| --- | --- |
| Destination port ranges | `80,443` |
| Protocol | TCP |
| Action | Allow |
| Name | `allow-http-https` |

Cổng 22 (SSH) thường đã mở sẵn. Cổng 80 cần cho Caddy xin chứng chỉ, cổng 443 là HTTPS.

**Đặt tên miền.** Portal → VM → bấm vào **Public IP address** → **Configuration** → ô **DNS name label**, gõ ví
dụ `fat-api` → **Save**. Bạn nhận được tên miền dạng `fat-api.<vùng>.cloudapp.azure.com`; VM ở East Asia thì là
`fat-api.eastasia.cloudapp.azure.com`. Từ đây gọi nó là `<API_DOMAIN>`.

Public IP phải là **Static** để IP không đổi khi VM khởi động lại.

---

## 2. Cài Docker trên VM

Trên máy bạn, trong thư mục dự án (thay `key.pem`, `azureuser` và IP cho đúng):

```bash
cd ~/Downloads/FAT
chmod 600 key.pem
scp -i key.pem deploy/vm/setup.sh azureuser@<IP-của-VM>:
ssh -i key.pem azureuser@<IP-của-VM> "bash setup.sh"
```

Script cài Docker từ kho chính thức của Docker và tạo thư mục `/opt/fat-guide`. Xong thì thử lại:

```bash
ssh -i key.pem azureuser@<IP-của-VM> "docker compose version"
```

Phải in ra phiên bản (ví dụ `Docker Compose version v2…`). Nếu báo *permission denied* thì SSH lại một lần
nữa: quyền dùng Docker chỉ có hiệu lực từ lần đăng nhập sau.

Nên cất file `.pem` ở `~/.ssh/`, không để trong thư mục dự án. Nếu lỡ để thì nó cũng không bị commit, vì
`.gitignore` đã loại mọi file `*.pem`.

---

## 3. Frontend lên Vercel

1. vercel.com → **Add New… → Project** → **Import** repo `FATExamPreparation`.
2. **Root Directory**: bấm **Edit**, chọn **`client`**.
3. **Environment Variables**: `VITE_API_BASE_URL` = `https://<API_DOMAIN>` (không có `/` cuối, không có `/api`).
4. **Deploy**. Copy domain chính, dạng `https://<project>.vercel.app`. Từ đây gọi nó là `<VERCEL_URL>`.

Từ giờ mỗi lần push, Vercel tự deploy lại frontend.

---

## 4. GitHub: khai báo cho workflow

Repo trên GitHub → **Settings → Secrets and variables → Actions**.

Tab **Secrets** → **New repository secret**, thêm 5 secret:

| Name | Value |
| --- | --- |
| `VM_SSH_KEY` | Toàn bộ nội dung file `.pem`, kể cả dòng `-----BEGIN …-----` và `-----END …-----` |
| `VM_HOST` | IP hoặc `<API_DOMAIN>` của VM |
| `VM_USER` | user SSH, thường là `azureuser` |
| `API_DOMAIN` | `<API_DOMAIN>` |
| `FRONTEND_ORIGIN` | `<VERCEL_URL>` (có `https://`, không có `/` cuối) |

Secret lưu xong thì không xem lại được và hiện thành `***` trong log, nên gõ thật cẩn thận. Lấy nội dung
`.pem` để dán: `cat ~/.ssh/key.pem`, copy hết. Chỉ dán vào ô secret của GitHub, không gửi cho ai.

---

## 5. Chạy deploy lần đầu

GitHub → tab **Actions** → **Deploy API to Azure VM** → **Run workflow**. Workflow gồm:

1. **test**: chạy test và build backend.
2. **deploy**: build image, đẩy lên GHCR, chép `deploy/vm/` lên VM, khởi động lại, rồi kiểm tra
   `https://<API_DOMAIN>/api/health`.

Thấy cả hai job xanh là xong. Mở `https://<API_DOMAIN>/api/health` phải thấy:

```json
{"status":"ok","hexDumps":5}
```

Rồi mở `<VERCEL_URL>`: các hex dump phải tải được. Từ đây, mỗi lần push thay đổi backend là tự deploy.

---

## 6. Giữ credit Azure an toàn

Gói **Azure for Students** không trừ tiền thẻ. Khi hết $100 credit hoặc hết 12 tháng, Azure **tắt** VM và
subscription. Tiền chỉ bị trừ nếu bạn **nâng cấp lên Pay-As-You-Go**.

1. **Kiểm tra gói.** Portal → **Subscriptions** → bấm vào subscription → mục **Offer** phải là
   `Azure for Students`. Nếu là `Pay-As-You-Go` thì subscription đã gắn thẻ và không có giới hạn chi tiêu: làm
   bước 3 ngay.
2. **Không bấm Upgrade** khi Azure mời nâng cấp, trừ khi bạn muốn trả tiền.
3. **Đặt budget để nhận email.** Portal → **Cost Management** → **Budgets** → **Add**: Reset period
   `Monthly`, Amount `10` (USD). Phần Alert conditions: `Actual` 50 %, 80 %, 100 % và `Forecasted` 100 %, điền
   email của bạn. Nếu Azure báo gói không hỗ trợ budget thì bỏ qua bước này và làm bước 4 mỗi tuần.
4. **Xem credit còn lại** ở [microsoftazuresponsors.com](https://www.microsoftazuresponsors.com/) → **Balance**
   (đăng nhập bằng tài khoản Azure for Students).
5. **Xem cái gì đang tốn tiền.** **Cost Management** → **Cost analysis** → chọn view **Cost by resource**.

   | Thấy trong danh sách | Nên là | Nếu khác |
   | --- | --- | --- |
   | Virtual machine | Size `B1s` | VM → **Size** → chọn `B1s` (đủ cho API này) |
   | Disk của VM | `Standard SSD` | Stop VM → Disk → **Size + performance** → `Standard SSD` |
   | Public IP | 1 IP Static | Giữ nguyên (cần cho tên miền) |
   | Bastion | Không có | **Xóa** (trừ bản Developer): bản Basic tính theo giờ, hơn $100 một tháng |
   | Microsoft Defender for Cloud | Tắt | Defender for Cloud → **Environment settings** → subscription → tắt các plan |
   | Log Analytics workspace, Snapshot, Backup | Không có | Xóa nếu không dùng |

6. **Khi không cần dùng** (ví dụ sau kỳ thi): VM → **Stop**. Trạng thái *Stopped (deallocated)* thì không tính
   tiền máy, chỉ còn ổ đĩa và Public IP. Bấm **Start** khi cần; IP và tên miền giữ nguyên, API tự chạy lại.
7. **Bật xác thực 2 bước (MFA)** cho tài khoản Microsoft dùng Azure và cho GitHub. Người lấy được mật khẩu Azure
   có thể tạo máy ảo đắt tiền trên subscription của bạn.

Những giới hạn đã có sẵn trong code, không cần làm gì:

| Giới hạn | Giá trị | Ở đâu |
| --- | --- | --- |
| Request mỗi IP | 300 / phút (một lượt xem cả trang cần 6) | `RateLimits` trong `server/appsettings.json` |
| Request tổng, mọi IP cộng lại | 1 800 / phút | như trên |
| Vượt giới hạn | Trả `429`, trang báo đợi một phút | `server/Security/RateLimiting.cs` |
| Trình duyệt giữ dữ liệu | 10 phút, không hỏi lại API | `HexDumpsController` |
| Caddy chỉ cho qua | `GET`/`HEAD` tới `/api/...`; còn lại trả 404 | `deploy/vm/Caddyfile` |
| Mỗi container | 0,5 CPU, 256 MB RAM, log tối đa 3 × 10 MB | `deploy/vm/docker-compose.yml` |
| Container API | Chỉ đọc, không ra được Internet | như trên |

Mỗi lần API trả một dump khoảng 0,7 KB. Dù bị gọi liên tục ở mức trần 1 800 / phút suốt một tháng thì cũng chỉ
khoảng 55 GB, dưới 100 GB dữ liệu ra miễn phí mỗi tháng của Azure.

---

## 7. Khóa SSH trên VM

Làm **một lần**, sau lần deploy đầu tiên có file `harden.sh` (workflow chép nó vào `/opt/fat-guide`):

```bash
ssh -i key.pem azureuser@<IP-của-VM> "bash /opt/fat-guide/harden.sh"
```

| Script làm | Để làm gì |
| --- | --- |
| Tắt đăng nhập SSH bằng mật khẩu và bằng `root` | Chỉ ai có file `.pem` mới vào được |
| Cài `fail2ban` | Chặn IP đoán mật khẩu SSH nhiều lần |
| Bật cập nhật bảo mật tự động của Ubuntu | Vá lỗi hệ điều hành mỗi ngày |

Script dừng lại, không đổi gì, nếu VM chưa có SSH key (để bạn không bị khóa ngoài).

---

## Lỗi thường gặp

| Triệu chứng | Nguyên nhân | Cách sửa |
| --- | --- | --- |
| Job deploy báo `Secret … is not set` | Thiếu secret ở bước 4 | Thêm secret còn thiếu, chạy lại workflow |
| Lỗi ở bước *Deploy to the VM*: `Permission denied (publickey)` | Sai `VM_USER` hoặc `VM_SSH_KEY` dán thiếu dòng | Dán lại đủ nội dung `.pem`; kiểm tra user bằng `ssh -i key.pem <user>@<IP>` |
| `scp: /opt/fat-guide/...: No such file or directory` | Chưa chạy `setup.sh` (bước 2) | Làm bước 2 |
| `docker: command not found` hoặc `permission denied … docker.sock` | Docker chưa cài, hoặc user chưa vào nhóm docker | Chạy lại bước 2, rồi SSH lại |
| Bước *Check the public URL* lỗi | Cổng 80/443 chưa mở, hoặc DNS name label chưa đặt | Làm lại bước 1; xem `docker compose logs caddy` trên VM |
| Trang Vercel báo “Chưa tải được”, Console có chữ `CORS` | Secret `FRONTEND_ORIGIN` sai hoặc thừa `/` cuối | Ghi đè secret đó rồi chạy lại workflow |
| Trang Vercel báo “Chưa tải được (HTTP 404)” | `VITE_API_BASE_URL` sai, ví dụ có thêm `/api` | Sửa biến trên Vercel rồi **Redeploy** |
| Link preview của Vercel không tải được API | CORS chỉ cho phép domain chính | Bình thường; dùng domain chính |
| Trang báo “HTTP 429” | Vượt giới hạn request, ví dụ cả lớp dùng chung một Wi-Fi | Đợi một phút; nếu hay gặp thì tăng `PerIpPerMinute` trong `server/appsettings.json` rồi push |
| Trang Vercel trắng, Console có chữ `Content-Security-Policy` | Trang tải một địa chỉ ngoài danh sách cho phép | Thêm địa chỉ đó vào `contentSecurityPolicy` trong `client/vite.config.js` |

Xem log trên VM:

```bash
ssh -i key.pem azureuser@<IP-của-VM>
cd /opt/fat-guide && docker compose ps && docker compose logs --tail=50
```
