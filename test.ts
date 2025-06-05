// tests go here; this will not be compiled when this package is used as an extension.
/**
 * Exemple d'utilisation de l'extension Robot Navigator
 * avec différentes extensions de robots
 */
/*
// ========================================
// EXEMPLE 1: Avec une extension générique
// ========================================

// Au démarrage - Configuration
robotNavigator.configurePosition(
    () => monRobot.obtenirX(),        // Fonction qui retourne X
    () => monRobot.obtenirY(),        // Fonction qui retourne Y
    () => monRobot.obtenirAngle()     // Fonction qui retourne l'angle
)

robotNavigator.configureMotors(
    (vitesse) => monRobot.avancer(vitesse),
    (vitesse) => monRobot.tournerGauche(vitesse),
    (vitesse) => monRobot.tournerDroite(vitesse),
    () => monRobot.arreter()
)

// ========================================
// EXEMPLE 2: Avec contrôle différentiel
// ========================================

// Pour un meilleur contrôle avec correction vectorielle
robotNavigator.configureMotorsDifferential(
    (vitesse) => monRobot.moteurGauche(vitesse),
    (vitesse) => monRobot.moteurDroit(vitesse)
)

// ========================================
// EXEMPLE 3: Avec l'extension DFRobot Maqueen
// ========================================

// Configuration pour Maqueen avec position simulée
let posX = 0
let posY = 0
let angle = 0

// Mettre à jour la position (à appeler régulièrement)
basic.forever(() => {
    // Ici tu dois mettre à jour posX, posY et angle
    // selon les données de ton driver
})

robotNavigator.configurePosition(
    () => posX,
    () => posY,
    () => angle
)

robotNavigator.configureMotorsDifferential(
    (speed) => maqueen.motorRun(maqueen.Motors.M1, maqueen.Dir.CW, speed),
    (speed) => maqueen.motorRun(maqueen.Motors.M2, maqueen.Dir.CW, speed)
)

// ========================================
// EXEMPLE 4: Avec des servos sur pins
// ========================================

robotNavigator.configurePosition(
    () => capteurPosition.x,
    () => capteurPosition.y,
    () => capteurPosition.angle
)

// Servos à rotation continue sur P0 et P1
robotNavigator.configureMotorsDifferential(
    (speed) => {
        // Servo gauche (90 = stop, 0 = pleine vitesse arrière, 180 = pleine avant)
        let servoValue = 90 + (speed * 0.9)
        pins.servoWritePin(AnalogPin.P0, servoValue)
    },
    (speed) => {
        // Servo droit (inversé)
        let servoValue = 90 - (speed * 0.9)
        pins.servoWritePin(AnalogPin.P1, servoValue)
    }
)

// ========================================
// EXEMPLE 5: Avec callbacks personnalisés
// ========================================

class MonSystemePosition {
    private x: number = 0
    private y: number = 0
    private angle: number = 0

    // Méthode pour mettre à jour depuis des encodeurs
    updateFromEncoders(leftTicks: number, rightTicks: number) {
        // Calculs de position...
    }

    getX(): number { return this.x }
    getY(): number { return this.y }
    getAngle(): number { return this.angle }
}

let systemePos = new MonSystemePosition()

robotNavigator.configurePosition(
    () => systemePos.getX(),
    () => systemePos.getY(),
    () => systemePos.getAngle()
)

// ========================================
// UTILISATION COMMUNE
// ========================================

// 1. Définir un parcours
robotNavigator.clearWaypoints()
robotNavigator.addWaypoint(100, 100)
robotNavigator.addWaypoint(200, 100)
robotNavigator.addWaypoint(200, 200)
robotNavigator.addWaypoint(100, 200)

// 2. Configurer les paramètres
robotNavigator.setSpeed(50)
robotNavigator.setPositionTolerance(10)
robotNavigator.setAngleTolerance(10)
robotNavigator.setCorrectionGain(0.5)
robotNavigator.enableCorrection()

// 3. Contrôles
input.onButtonPressed(Button.A, () => {
    robotNavigator.startNavigation()
})

input.onButtonPressed(Button.B, () => {
    robotNavigator.stopNavigation()
})

// 4. Affichage de debug
input.onGesture(Gesture.Shake, () => {
    robotNavigator.showStatus()
})

// ========================================
// EXEMPLE AVANCÉ: Intégration complète
// ========================================

// Namespace pour encapsuler ton driver
namespace monDriver {
    let x = 0
    let y = 0
    let angle = 0
    let leftEncoder = 0
    let rightEncoder = 0

    const WHEEL_DIAMETER = 6.5 // cm
    const WHEEL_BASE = 12 // cm
    const TICKS_PER_ROTATION = 20

    // Fonction appelée par interruption sur les encodeurs
    export function onLeftEncoder() {
        leftEncoder++
        updatePosition()
    }

    export function onRightEncoder() {
        rightEncoder++
        updatePosition()
    }

    function updatePosition() {
        // Calcul de l'odométrie différentielle
        let leftDistance = (leftEncoder / TICKS_PER_ROTATION) * Math.PI * WHEEL_DIAMETER
        let rightDistance = (rightEncoder / TICKS_PER_ROTATION) * Math.PI * WHEEL_DIAMETER

        let distance = (leftDistance + rightDistance) / 2
        let deltaAngle = (rightDistance - leftDistance) / WHEEL_BASE

        angle += deltaAngle * 180 / Math.PI
        x += distance * Math.cos(angle * Math.PI / 180)
        y += distance * Math.sin(angle * Math.PI / 180)
    }

    export function getX(): number { return x }
    export function getY(): number { return y }
    export function getAngle(): number { return angle % 360 }

    export function resetPosition() {
        x = 0
        y = 0
        angle = 0
        leftEncoder = 0
        rightEncoder = 0
    }
}

// Configuration avec le driver personnalisé
robotNavigator.configurePosition(
    () => monDriver.getX(),
    () => monDriver.getY(),
    () => monDriver.getAngle()
)

// Configuration des interruptions pour les encodeurs
pins.onPulsed(DigitalPin.P2, PulseValue.High, () => {
    monDriver.onLeftEncoder()
})

pins.onPulsed(DigitalPin.P8, PulseValue.High, () => {
    monDriver.onRightEncoder()
})
*/