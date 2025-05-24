# Robot Navigator Extension

Extension de navigation autonome pour robots micro:bit avec correction vectorielle.

## Utilisation

### 1. Configuration basique

```blocks
// Configurer les fonctions de position
robotNavigator.configurer position avec
    X: () => tonDriver.getX()
    Y: () => tonDriver.getY()
    angle: () => tonDriver.getAngle()

// Configurer les moteurs
robotNavigator.configurer moteurs
    avancer: (speed) => tonDriver.forward(speed)
    gauche: (speed) => tonDriver.turnLeft(speed)
    droite: (speed) => tonDriver.turnRight(speed)
    stop: () => tonDriver.stop()
```

### 2. Configuration avec moteurs différentiels

```blocks
// Pour un contrôle plus précis avec correction vectorielle
robotNavigator.configurer moteurs différentiels
    gauche: (speed) => tonDriver.setLeftMotor(speed)
    droite: (speed) => tonDriver.setRightMotor(speed)
```

### 3. Créer un parcours

```blocks
robotNavigator.effacer tous les points
robotNavigator.ajouter point x 100 y 100
robotNavigator.ajouter point x 200 y 100
robotNavigator.ajouter point x 200 y 200
robotNavigator.ajouter point x 100 y 200
```

### 4. Paramètres et navigation

```blocks
robotNavigator.vitesse 50
robotNavigator.tolérance position 10
robotNavigator.tolérance angle 10
robotNavigator.gain correction 0.5
robotNavigator.activer correction
robotNavigator.démarrer navigation
```

## Exemple complet avec l'extension Maqueen

```typescript
// Au démarrage
robotNavigator.configurePosition(
    () => maqueen.readPatrol(maqueen.Patrol.PatrolLeft),
    () => maqueen.readPatrol(maqueen.Patrol.PatrolRight),
    () => 0 // Ton driver d'angle
)

robotNavigator.configureMotors(
    (speed) => maqueen.motorRun(maqueen.Motors.All, maqueen.Dir.CW, speed),
    (speed) => {
        maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CCW, speed)
        maqueen.motorRun(maqueen.Motors.M2, maqueen.Dir.CW, speed)
    },
    (speed) => {
        maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CW, speed)
        maqueen.motorRun(maqueen.Motors.M2, maqueen.Dir.CCW, speed)
    },
    () => maqueen.motorStop(maqueen.Motors.All)
)

// Créer un parcours
robotNavigator.clearWaypoints()
robotNavigator.addWaypoint(100, 100)
robotNavigator.addWaypoint(200, 200)

// Démarrer
robotNavigator.startNavigation()
```

## Blocs disponibles

### Configuration
- `configurer position avec X Y angle` - Configure les fonctions de lecture de position
- `configurer moteurs` - Configure les fonctions de contrôle basique
- `configurer moteurs différentiels` - Configure le contrôle différentiel

### Navigation
- `ajouter point x y` - Ajoute un point de passage
- `effacer tous les points` - Efface le parcours
- `démarrer navigation` - Lance la navigation
- `arrêter navigation` - Arrête le robot
- `activer/désactiver correction` - Active la correction vectorielle

### Paramètres
- `vitesse` - Vitesse de déplacement (0-100)
- `tolérance position` - Distance pour considérer un point atteint
- `tolérance angle` - Précision de rotation
- `gain correction` - Sensibilité de la correction (0-1)

## Licence

