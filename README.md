```markdown
# MYPCTRACKER

MYPCTRACKER es un proyecto que permite enviar la ubicación de un PC desde PowerShell y visualizarla en una página web.

## Descripción

Este proyecto consta de dos partes principales: una parte del servidor web construido con Node.js y Express, y una parte del cliente que envía la ubicación desde PowerShell.

### Servidor Web

El servidor web está construido con Node.js y Express. Utiliza la librería EJS para renderizar las páginas web dinámicamente. Las ubicaciones enviadas por el cliente se almacenan en el servidor y se muestran en la página web.

### Cliente (PowerShell)

El cliente está escrito en PowerShell y se encarga de obtener la ubicación del PC y enviarla al servidor web. Utiliza la API de geolocalización de IP para obtener información sobre la ubicación y realiza una solicitud POST al servidor web con estos datos.

## Configuración

Asegúrate de tener Node.js y npm instalados en tu máquina antes de ejecutar el servidor web. Luego, sigue estos pasos:

1. Clona este repositorio:

   ```bash
   git clone https://github.com/tuusuario/mypctracker.git
   cd mypctracker

```

1. Instala las dependencias:
    
    ```bash
    bashCopy code
    npm install
    
    ```
    
2. Ejecuta el servidor:
    
    ```bash
    bashCopy code
    node index.js
    
    ```
    
3. Abre tu navegador y visita http://localhost:3000/tracker para ver la página web y la última ubicación enviada desde PowerShell.

## **Uso**

Para enviar la ubicación desde PowerShell, utiliza el siguiente script:

```powershell
powershellCopy code
cls

function Get-IPAddressLocation {
    $IPAddress = (Invoke-RestMethod -Uri 'https://api64.ipify.org?format=json').ip
    $GeoData = (Invoke-RestMethod -Uri "https://ipapi.co/$IPAddress/json/")

    $Location = @{
        IP = $GeoData.ip
        Ciudad = $GeoData.city
        Region = $GeoData.region
        Pais = $GeoData.country_name
        Latitud = $GeoData.latitude
        Longitud = $GeoData.longitude
    }

    return $Location
}

$Ubicacion = Get-IPAddressLocation

$WebServiceUrl = "http://localhost:3000/send-notification"
$NotificationData = @{
    title     = "Ubicacion del Portatil"
    message   = "Nueva ubicacion disponible."
    deviceId  = "ID_UNICO_DE_TU_DISPOSITIVO"
    ubicacion = $Ubicacion
}

try {
    $response = Invoke-RestMethod -Uri $WebServiceUrl -Method Post -Body ($NotificationData | ConvertTo-Json) -ContentType 'application/json'
    Write-Host "Respuesta del servidor: $response"
}
catch {
    Write-Host "Error al enviar la solicitud al servidor. Detalles: $_"
}

Write-Host "Ubicación enviada al servicio web:"
Write-Host "IP: $($Ubicacion.IP)"
Write-Host "Ciudad: $($Ubicacion.Ciudad)"
Write-Host "Region: $($Ubicacion.Region)"
Write-Host "Pais: $($Ubicacion.Pais)"
Write-Host "Latitud: $($Ubicacion.Latitud)"
Write-Host "Longitud: $($Ubicacion.Longitud)"

```

Asegúrate de personalizar el **`deviceId`** con un identificador único para tu dispositivo.

¡Disfruta rastreando la ubicación de tu PC con MYPCTRACKER!

```arduino
arduinoCopy code

Recuerda reemplazar `"tuusuario"` y `"ID_UNICO_DE_TU_DISPOSITIVO"` con tus detalles específicos. Este README debería proporcionar una descripción general y pasos básicos para ejecutar y utilizar tu proyecto.

```