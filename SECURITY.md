# Security Checklist

## Environment Variables

### Vercel (Frontend)
Set these in Vercel Dashboard > Project Settings > Environment Variables:

```
NODE_ENV=production
VITE_API_URL=https://your-render-app.onrender.com
VITE_SUPABASE_URL=https://ktywqplfwftkaehylcjc.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### Render (Backend)
Set these in Render Dashboard > Service Settings > Environment:

```
NODE_ENV=production
PORT=10000
SUPABASE_URL=https://ktywqplfwftkaehylcjc.supabase.co
SUPABASE_SERVICE_KEY=your_service_key_here
JWT_SECRET=your_jwt_secret_here
DATABASE_URL=your_database_url_here
```

## Important Security Notes

1. **Never commit sensitive credentials** to the repository
2. **Use environment variables** for all secrets
3. **Rotate keys regularly** especially if they've been exposed
4. **Enable CORS** only for your production domains
5. **Use HTTPS** for all production endpoints
6. **Enable Supabase RLS** (Row Level Security) for data protection

## Supabase Security

1. Go to Supabase Dashboard > Authentication > Settings
2. Enable RLS on all tables
3. Set up proper policies for user access
4. Use the anon key for frontend, service key for backend only

## CORS Configuration

Update your backend CORS settings to only allow your production domains:

```javascript
app.use(cors({
  origin: [
    'https://clktechtr.vercel.app',
    'https://your-custom-domain.com',
    'http://localhost:5173' // Only for development
  ],
  credentials: true
}));
```

## SSL/TLS

- Vercel automatically provides SSL certificates
- Render automatically provides SSL certificates
- Supabase uses SSL by default

## Monitoring

- Enable Vercel Analytics
- Monitor Render logs for security issues
- Set up Supabase alerts for unusual activity