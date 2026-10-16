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

Xem log trên VM:

```bash
ssh -i key.pem azureuser@<IP-của-VM>
cd /opt/fat-guide && docker compose ps && docker compose logs --tail=50
```
