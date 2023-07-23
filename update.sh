node generate.js
find -name "*.json" | xargs -I {} ../../json_formatter.exe {}
