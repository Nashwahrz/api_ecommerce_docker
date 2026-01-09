# Gunakan image node versi alpine agar ringan
FROM node:18-alpine

# Set folder kerja
WORKDIR /app

# Copy package.json terlebih dahulu untuk optimasi cache
COPY package*.json ./

# Install dependensi
RUN npm install

# Copy semua kode sumber
COPY . .

# Expose port (akan disesuaikan via docker-compose)
EXPOSE 3000

# Jalankan aplikasi
CMD ["npm", "start"]