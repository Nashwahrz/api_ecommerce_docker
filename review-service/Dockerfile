# Gunakan image python versi alpine
FROM python:3.11-alpine

# Set folder kerja
WORKDIR /app

# Install build dependencies (diperlukan untuk beberapa library python)
RUN apk add --no-cache gcc musl-dev linux-headers

# Copy requirements.txt (pastikan file ini ada)
COPY requirements.txt .

# Install library python
RUN pip install --no-cache-dir -r requirements.txt

# Copy semua kode sumber
COPY . .

# Expose port (akan disesuaikan via docker-compose)
EXPOSE 5004

# Jalankan aplikasi (asumsi menggunakan flask atau fastapi)
CMD ["python", "app.py"]