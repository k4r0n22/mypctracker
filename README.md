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
   git clone https://github.com/DJCARLOX/mypctracker.git
   cd mypctracker

1. Instala las dependencias:
    
    ```bash
    npm install
    
    ```
    
2. Ejecuta el servidor:
    
    ```bash
    npm run dev
    
    ```
    
3. Abre tu navegador y visita https://mypctracker.up.railway.app para ver la página web y la última ubicación enviada desde PowerShell.

## **Uso**

Para enviar la ubicación desde PowerShell, utiliza el siguiente script:

```powershell

cls

function Show-Banner {
    Write-Host
    Write-Host "  ____   ____ _____ ____      _    ____ _  _______ ____  " -ForegroundColor Magenta
    Write-Host " |  _ \ / ___|_   _|  _ \    / \  / ___| |/ / ____|  _ \ " -ForegroundColor Magenta
    Write-Host " | |_) | |     | | | |_) |  / _ \| |   | ' /|  _| | |_) |" -ForegroundColor Magenta
    Write-Host " |  __/| |___  | | |  _ <  / ___ \ |___| . \| |___|  _ < " -ForegroundColor Magenta
    Write-Host " |_|    \____| |_| |_| \_\/_/   \_\____|_|\_\_____|_| \_\" -ForegroundColor Magenta
    Write-host
    Write-host "   --------------------- by K4R0N ---------------------  " -ForegroundColor Green
    Write-host 
}

Show-Banner

# Función para habilitar la configuración de ubicación
function Enable-LocationServices {
    try {
        # Verificar
        $locationSetting = Get-ItemProperty -Path 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\location' -Name 'Value'

        if ($locationSetting.Value -ne 'Allow') {
            Write-Host "La configuración de ubicación del sistema no está habilitada. Habilitándola ahora..."

            # Habilitar ubicación del sistema
            Set-ItemProperty -Path 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\location' -Name 'Value' -Value 'Allow'

            Write-Host "La configuración de ubicación del sistema ha sido habilitada."
        } else {
            Write-Host "La configuración de ubicación del sistema ya está habilitada."
        }

        # Habilitar ubicación para el usuario actual
        Set-ItemProperty -Path 'HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\location' -Name 'Value' -Value 'Allow'
        Write-Host "La configuración de ubicación para el usuario actual ha sido habilitada."
    } catch {
        Write-Host "Error al habilitar la configuración de ubicación: $_"
    }
}

Enable-LocationServices

try {
    # Verificar si el ensamblado System.Device está disponible y cargarlo
    try {
        Add-Type -AssemblyName System.Device
    } catch {
        Write-Host "No se pudo cargar el ensamblado System.Device: $_"
        throw "Dependencia faltante: System.Device"
    }

    $correo = Read-Host "Inserte su email de usuario"
    $fecha = Get-Date

    # Obtener ubicación por la IP
    function Get-IPAddressLocation {
        $IPAddress = (Invoke-RestMethod -Uri 'https://api64.ipify.org?format=json').ip
        $GeoData = (Invoke-RestMethod -Uri "https://ipapi.co/$IPAddress/json/")

        $Location = @{
            IP = $GeoData.ip
            Ciudad = $GeoData.city
            Region = $GeoData.region
            Pais = $GeoData.country_name
        }

        return $Location
    }

    # Función para obtener la ubicación precisa por GPS
    function Get-PreciseLocation {
        try {
     
            $geoWatcher = New-Object System.Device.Location.GeoCoordinateWatcher

   
            $geoWatcher.Start()

     
            $maxWait = 10
            $waited = 0
            while (($geoWatcher.Status -eq 'Initializing' -or $geoWatcher.Status -eq 'NoData') -and $waited -lt $maxWait) {
                Start-Sleep -Seconds 1
                $waited += 1
            }

 
            if ($geoWatcher.Status -eq 'Ready') {
                $coordinate = $geoWatcher.Position.Location

                $geoWatcher.Stop()

                return @{
                    Latitud = $coordinate.Latitude
                    Longitud = $coordinate.Longitude
                }
            } else {
                throw "No se pudo obtener la ubicación precisa. Asegúrate de que los permisos de ubicación estén habilitados y que tu dispositivo tenga un receptor GPS o capacidad de ubicación basada en Wi-Fi."
            }
        } catch {
            Write-Host "Error al obtener la ubicación precisa: $_"
            return $null
        }
    }

    # OBTENER UBICACION
    $UbicacionIP = Get-IPAddressLocation
    Write-Host "Ubicación IP obtenida: $UbicacionIP"

    $UbicacionPrecisa = Get-PreciseLocation
    if ($UbicacionPrecisa -eq $null) {
        Write-Host "No se pudo obtener la ubicación precisa. Usando solo la ubicación basada en IP."
        $UbicacionPrecisa = @{ Latitud = "No disponible"; Longitud = "No disponible" }
    } else {
        Write-Host "Ubicación precisa obtenida: $UbicacionPrecisa"
    }

    # Combinar en una tabla
    $Ubicacion = @{
        IP = $UbicacionIP.IP
        Ciudad = $UbicacionIP.Ciudad
        Region = $UbicacionIP.Region
        Pais = $UbicacionIP.Pais
        Latitud = $UbicacionPrecisa.Latitud
        Longitud = $UbicacionPrecisa.Longitud
    }

    # VER EN CONSOLA
    Write-Host "Ubicación obtenida:"
    $Ubicacion | Format-Table

    # ENVIAR AL SERVER
    $WebServiceUrl = "https://mypctracker.up.railway.app/send-notification/"
    $NotificationData = @{
        title     = "Ubicacion del Portatil"
        message   = "Nueva ubicacion disponible."
        deviceId  = "$($env:COMPUTERNAME)"
        ubicacion = $Ubicacion
        userId    = "$correo"
        fecha = "$fecha"
    }

    try {
        $response = Invoke-RestMethod -Uri $WebServiceUrl -Method Post -Body ($NotificationData | ConvertTo-Json) -ContentType 'application/json'
        Write-Host "Respuesta del servidor: $response" -BackgroundColor Green
    } catch {
        Write-Host "Error al enviar la solicitud al servidor. Detalles: $_" -BackgroundColor DarkRed
        $_ | Out-File -FilePath "error_log.txt" -Append
    }

    Write-Host "Ubicación enviada al servicio web:"
    Write-Host "Dispositivo: $($env:COMPUTERNAME)"
    Write-Host "IP: $($Ubicacion.IP)"
    Write-Host "Ciudad: $($Ubicacion.Ciudad)"
    Write-Host "Region: $($Ubicacion.Region)"
    Write-Host "Pais: $($Ubicacion.Pais)"
    Write-Host "Latitud: $($Ubicacion.Latitud)"
    Write-Host "Longitud: $($Ubicacion.Longitud)"

} catch {
    Write-Host "Se ha producido un error: $_" -BackgroundColor Red
    $_ | Out-File -FilePath "error_log.txt" -Append
}


```

Asegúrate de personalizar el **`deviceId`** con un identificador único para tu dispositivo.

¡Disfruta rastreando la ubicación de tu PC con MYPCTRACKER!

## CAPTURAS

### INICIO
![Texto Alternativo](/src/public/img/index.png)

### ABOUT
![Texto Alternativo](/src/public/img/about.png)

### CONTACT
![Texto Alternativo](/src/public/img/contact.png)

### TRACKER
![Texto Alternativo](/src/public/img/tracker.png)