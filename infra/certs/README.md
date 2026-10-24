# Certificados TLS del origen

Cloudflare termina el TLS público y habla con este nginx por HTTPS. Nginx
espera dos archivos en esta carpeta:

```text
infra/certs/origin.pem   # certificado (puede incluir la cadena)
infra/certs/origin.key   # clave privada
```

No se versionan: `infra/certs/*` está en `.gitignore`.

## Opción recomendada: Cloudflare Origin Certificate

1. En Cloudflare → SSL/TLS → Origin Server → Create Certificate.
2. Hostname: `hexario.thorque.com.ar`.
3. Copiá el certificado a `origin.pem` y la clave a `origin.key`.
4. En Cloudflare → SSL/TLS → Overview, elegí **Full (strict)**.
5. Permisos:

```bash
chmod 600 infra/certs/origin.key
```

## Opción rápida: self-signed + Full

Sirve para arrancar sin esperar el certificado de Cloudflare. Cloudflare valida
que el origen tenga TLS, pero no la cadena; por eso hay que usar **Full**, no
Full (strict).

```bash
cd infra/certs
openssl req -x509 -nodes -newkey rsa:2048 -days 3650 \
  -keyout origin.key -out origin.pem \
  -subj "/CN=hexario.thorque.com.ar"
chmod 600 origin.key
```

Si después pasás a Origin Certificate, reemplazá los dos archivos y cambiá
Cloudflare a Full (strict).
