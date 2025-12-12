name = "yishan-app"
compatibility_date = "2024-02-22"
pages_build_output_dir = "dist"

# 配置 D1 数据库绑定
# binding 名称 "DB" 必须与 functions/utils.ts 中的 Env 接口一致
[[d1_databases]]
binding = "DB"
database_name = "yishan-db"
database_id = "请在此处填写执行 npx wrangler d1 create yishan-db 后获得的 id"
