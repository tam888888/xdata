#!/bin/bash

# Đường dẫn tới thư mục chứa các file .json
FOLDER="./"  # hoặc thay bằng thư mục cụ thể, ví dụ: /path/to/json/files

# Lặp qua từng file .json trong thư mục
for file in "$FOLDER"/*.json; do
  if [ -f "$file" ]; then
    gzip -c "$file" > "${file}.gz"
    echo "Đã nén: $file -> ${file}.gz"
  fi
done

