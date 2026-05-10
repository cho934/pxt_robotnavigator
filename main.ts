/**
 * Robot Navigator Extension - Compatible MakeCode micro:bit
 * Navigation autonome avec correction vectorielle
 * Configuration par référencement de fonctions existantes
 */

//% weight=100 color=#1d26a5 icon="\uf1b9" block="Robot Navigator"
//% groups=['Configuration', 'Navigation', 'Paramètres', 'Debug']
namespace robotNavigator {

    // Variables pour stocker les références de fonctions
    let getXFunction: () => number = null;
    let getYFunction: () => number = null;
    let getAngleDegFunction: () => number = null;
    let leftMotorFunction: (speed: number) => void = null;
    let rightMotorFunction: (speed: number) => void = null;
    let stopMotorFunction: () => void = null;

    // Variables internes
    let vitesse = 50
    let tolerancePosition = 10
    let toleranceAngleDeg = 10
    let correctionGain = 0.5
    let maxCorrection = 30
    let waypoints: number[][] = []
    let currentWaypoint = 0
    let navigationActive = false
    let correctionActive = true
    let lastError = 0

    // ====== CONFIGURATION PAR RÉFÉRENCES DE FONCTIONS =======

    /**
    * Configurer la fonction qui retourne la position Y
    * Ce bloc permet de définir votre propre logique pour obtenir Y
    */
    //% block="configurer function position Y"
    //% group="Configuration"
    //% weight=98
    //% handlerStatement=1
    export function configureYPositionFunc(handler: () => void): void {
        getYFunction = handler as any as (() => number);
    }

    /**
     * Configurer la fonction qui retourne la position X
     */
    //% block="configurer function position X"
    //% group="Configuration"
    //% weight=97
    //% handlerStatement=1
    export function configureXPosition(handler: () => void): void {
        getXFunction = handler as any as (() => number);
    }

    /**
     * Configurer la fonction qui retourne l'angle
     */
    //% block="configurer function position angle en degrees"
    //% group="Configuration"
    //% weight=96
    //% handlerStatement=1
    export function configureAngleDegPosition(handler: () => void): void {
        getAngleDegFunction = handler as any as (() => number);
    }

    /**
     * Configurer la fonction du moteur gauche
     */
    //% block="configurer function moteur gauche"
    //% group="Configuration"
    //% weight=95
    //% handlerStatement=1
    export function configureLeftMotor(handler: (speed: number) => void): void {
        leftMotorFunction = handler as any as ((speed: number) => void);
    }

    /**
     * Configurer la fonction du moteur droit
     */
    //% block="configurer function moteur droit"
    //% group="Configuration"
    //% weight=94
    //% handlerStatement=1
    export function configureRightMotor(handler: (speed: number) => void): void {
        rightMotorFunction = handler as any as ((speed: number) => void);
    }

    /**
     * Configurer la fonction d'arrêt des moteurs
     */
    //% block="configurer function arrêt moteurs"
    //% group="Configuration"
    //% weight=93
    //% handlerStatement=1
    export function configureStopMotors(handler: () => void): void {
        stopMotorFunction = handler as any as (() => void);
    }

    function isConfigurationComplete(): boolean {
        return getXFunction != null
            && getYFunction != null
            && getAngleDegFunction != null
            && leftMotorFunction != null
            && rightMotorFunction != null
            && stopMotorFunction != null;
    }

    /**
     * Tester la configuration
     */
    //% block="tester configuration"
    //% group="Configuration"
    //% weight=88
    export function testConfiguration(): void {
        if (isConfigurationComplete()) {
            basic.showString("POS: " + Math.round(getXFunction()) + "," + Math.round(getYFunction()));
            basic.pause(1000);
            basic.showString("ANGLE: " + Math.round(getAngleDegFunction()));
            basic.pause(1000);
            basic.showString("TEST MOTEUR");
            leftMotorFunction(30);
            rightMotorFunction(30);
            basic.pause(500);
            stopMotorFunction();
            basic.showString("OK");
        } else {
            basic.showString("INCOMPLET");
        }
    }

    // ====== FONCTIONS DE NAVIGATION =======

    /**
     * Ajoute un point de passage
     */
    //% block="ajouter point x $x y $y"
    //% group="Navigation"
    //% weight=80
    //% x.defl=100 y.defl=100
    export function addWaypoint(x: number, y: number): void {
        waypoints.push([x, y]);
        basic.showNumber(waypoints.length);
    }

    /**
     * Efface tous les points
     */
    //% block="effacer tous les points"
    //% group="Navigation"
    //% weight=79
    export function clearWaypoints(): void {
        waypoints = [];
        currentWaypoint = 0;
        basic.showString("CLEAR");
    }

    /**
     * Démarre la navigation
     */
    //% block="démarrer navigation"
    //% group="Navigation"
    //% weight=78
    export function startNavigation(): void {
        if (!isConfigurationComplete()) {
            basic.showString("ERR CONFIG");
            return;
        }
        if (waypoints.length == 0) {
            basic.showString("ERR POINTS");
            return;
        }
        navigationActive = true;
        currentWaypoint = 0;
        lastError = 0;
        basic.showString("START NAV");
    }

    /**
     * Arrête la navigation
     */
    //% block="arrêter navigation"
    //% group="Navigation"
    //% weight=77
    export function stopNavigation(): void {
        navigationActive = false;
        if (stopMotorFunction != null) {
            stopMotorFunction();
        }
        basic.showString("STOP NAV");
    }

    /**
     * Navigation active ?
     */
    //% block="navigation active ?"
    //% group="Navigation"
    //% weight=76
    export function isNavigationActive(): boolean {
        return navigationActive;
    }

    /**
     * Point courant
     */
    //% block="point courant"
    //% group="Navigation"
    //% weight=75
    export function getCurrentWaypoint(): number {
        return currentWaypoint + 1;
    }

    /**
     * Nombre total de points
     */
    //% block="nombre de points"
    //% group="Navigation"
    //% weight=74
    export function getTotalWaypoints(): number {
        return waypoints.length;
    }

    // ====== PARAMÈTRES =======

    /**
     * Définit la vitesse
     */
    //% block="vitesse $speed"
    //% group="Paramètres"
    //% weight=70
    //% speed.min=0 speed.max=100 speed.defl=50
    export function setSpeed(speed: number): void {
        vitesse = Math.constrain(speed, 0, 100);
    }

    /**
     * Définit la tolérance de position
     */
    //% block="tolérance position $tolerance"
    //% group="Paramètres"
    //% weight=69
    //% tolerance.defl=10
    export function setPositionTolerance(tolerance: number): void {
        tolerancePosition = tolerance;
    }

    /**
     * Définit la tolérance angulaire
     */
    //% block="tolérance angle (deg) $tolerance"
    //% group="Paramètres"
    //% weight=68
    //% tolerance.defl=10
    export function setAngleToleranceDeg(tolerance: number): void {
        toleranceAngleDeg = tolerance;
    }

    /**
     * Définit le gain de correction
     */
    //% block="gain correction $gain"
    //% group="Paramètres"
    //% weight=67
    //% gain.min=0 gain.max=1 gain.defl=0.5
    export function setCorrectionGain(gain: number): void {
        correctionGain = Math.constrain(gain, 0, 1);
    }

    /**
     * Active la correction vectorielle
     */
    //% block="activer correction"
    //% group="Navigation"
    //% weight=73
    export function enableCorrection(): void {
        correctionActive = true;
        basic.showString("CORR ON");
    }

    /**
     * Désactive la correction vectorielle
     */
    //% block="désactiver correction"
    //% group="Navigation"
    //% weight=72
    export function disableCorrection(): void {
        correctionActive = false;
        basic.showString("CORR OFF");
    }

    // ====== DEBUG =======

    /**
     * Affiche la position actuelle
     */
    //% block="afficher position"
    //% group="Debug"
    //% weight=60
    export function showPosition(): void {
        if (isConfigurationComplete()) {
            basic.showString("X:" + Math.round(getXFunction()));
            basic.pause(1000);
            basic.showString("Y:" + Math.round(getYFunction()));
            basic.pause(1000);
            basic.showString("A:" + Math.round(getAngleDegFunction()));
        } else {
            basic.showString("NO CONFIG");
        }
    }

    /**
     * Affiche l'état de navigation
     */
    //% block="afficher état navigation"
    //% group="Debug"
    //% weight=59
    export function showNavigationStatus(): void {
        if (navigationActive && waypoints.length > 0) {
            basic.showString("NAV " + (currentWaypoint + 1) + "/" + waypoints.length);
        } else if (waypoints.length == 0) {
            basic.showString("NO POINTS");
        } else {
            basic.showIcon(IconNames.No);
        }
    }

    /**
     * Obtenir la position X actuelle
     */
    //% block="position X actuelle"
    //% group="Debug"
    //% weight=58
    export function getCurrentX(): number {
        if (getXFunction != null) {
            return getXFunction();
        }
        return 0;
    }

    /**
     * Obtenir la position Y actuelle
     */
    //% block="position Y actuelle"
    //% group="Debug"
    //% weight=57
    export function getCurrentY(): number {
        if (getYFunction != null) {
            return getYFunction();
        }
        return 0;
    }

    /**
     * Obtenir l'angle actuel
     */
    //% block="angle actuel (deg)"
    //% group="Debug"
    //% weight=56
    export function getCurrentAngleDeg(): number {
        if (getAngleDegFunction != null) {
            return getAngleDegFunction();
        }
        return 0;
    }

    /**
     * Distance au point cible
     */
    //% block="distance au point cible"
    //% group="Debug"
    //% weight=55
    export function getDistanceToTarget(): number {
        if (isConfigurationComplete() && waypoints.length > 0 && currentWaypoint < waypoints.length) {
            let target = waypoints[currentWaypoint];
            return calculateDistance(getXFunction(), getYFunction(), target[0], target[1]);
        }
        return 0;
    }

    // ====== FONCTIONS INTERNES DE NAVIGATION =======

    function calculateDistance(x1: number, y1: number, x2: number, y2: number): number {
        let dx = x2 - x1;
        let dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }

    function calculateTargetAngle(currentX: number, currentY: number, targetX: number, targetY: number): number {
        let dx = targetX - currentX;
        let dy = targetY - currentY;
        let angle = Math.atan2(dy, dx) * 180 / Math.PI;
        if (angle < 0) angle += 360;
        return angle;
    }

    function normalizeAngleDifference(diff: number): number {
        while (diff > 180) diff -= 360;
        while (diff < -180) diff += 360;
        return diff;
    }

    function calculateLateralError(currentX: number, currentY: number, currentAngle: number, targetX: number, targetY: number): number {
        let dx = targetX - currentX;
        let dy = targetY - currentY;
        let angleRad = currentAngle * Math.PI / 180;
        let perpX = -Math.sin(angleRad);
        let perpY = Math.cos(angleRad);
        return dx * perpX + dy * perpY;
    }

    function navigateToPoint(targetX: number, targetY: number): boolean {
        let currentX = getXFunction();
        let currentY = getYFunction();
        let currentAngle = getAngleDegFunction();

        let distance = calculateDistance(currentX, currentY, targetX, targetY);

        if (distance <= tolerancePosition) {
            stopMotorFunction();
            return true;
        }

        let targetAngle = calculateTargetAngle(currentX, currentY, targetX, targetY);
        let angleDiff = normalizeAngleDifference(targetAngle - currentAngle);

        if (correctionActive && Math.abs(angleDiff) <= 45) {
            // Navigation avec correction vectorielle
            let lateralError = calculateLateralError(currentX, currentY, currentAngle, targetX, targetY);
            let normalizedError = lateralError / Math.max(distance, 10);
            let correction = normalizedError * correctionGain * 100;
            correction += (normalizedError - lastError) * 20;
            lastError = normalizedError;

            // Appliquer la correction
            correction = Math.constrain(correction, -maxCorrection, maxCorrection);
            let leftSpeed = Math.constrain(vitesse + correction, -100, 100);
            let rightSpeed = Math.constrain(vitesse - correction, -100, 100);

            leftMotorFunction(leftSpeed);
            rightMotorFunction(rightSpeed);

        } else if (Math.abs(angleDiff) > toleranceAngleDeg) {
            // Rotation sur place
            if (angleDiff > 0) {
                leftMotorFunction(Math.min(vitesse, Math.abs(angleDiff)));
                rightMotorFunction(-Math.min(vitesse, Math.abs(angleDiff)));
            } else {
                leftMotorFunction(-Math.min(vitesse, Math.abs(angleDiff)));
                rightMotorFunction(Math.min(vitesse, Math.abs(angleDiff)));
            }
        } else {
            // Avancer tout droit
            leftMotorFunction(vitesse);
            rightMotorFunction(vitesse);
        }

        return false;
    }

    // ====== BOUCLE DE NAVIGATION =======
    basic.forever(function () {
        if (navigationActive && waypoints.length > 0) {
            let target = waypoints[currentWaypoint];

            if (navigateToPoint(target[0], target[1])) {
                basic.showIcon(IconNames.Yes);
                basic.pause(500);
                basic.clearScreen();
                currentWaypoint = (currentWaypoint + 1) % waypoints.length;

                // Si on a fait tous les points, arrêter
                if (currentWaypoint == 0 && waypoints.length > 1) {
                    basic.showString("V");
                    navigationActive = false;
                    stopMotorFunction();
                }
            }
        }
    });
}


//% weight=100 color=#444444 icon="\uf1b9" block="Odometry"
namespace odometry {
    // Global variables for position tracking
    export let X = 0;           // X position in mm
    export let Y = 0;           // Y position in mm  
    export let alphaRad = 0;    // Orientation angle in radians

    // Configuration parameters
    export let entraxeInMM = 100;   // Distance between wheels in mm
    export let ticksPerMeter = 200000;   // Number of ticks per meter

    /**
     * Initialize the odometry module with specific parameters
     * @param trackWidth Distance between encoders' wheels in mm
     * @param ticksPerMeter Number of encoder ticks per meter
     */
    //% block="initialize odometry with trackWidth %trackWidth|mm and %ticksPerMeter|ticks per meter"
    export function initialize(entraxe_mm: number, nbticksPerMeter: number) {
        entraxeInMM = entraxe_mm;
        ticksPerMeter = nbticksPerMeter;
        X = 0;
        Y = 0;
        alphaRad = 0;
    }

    /**
     * Reset position and orientation to zero
     */
    //% block="reset odometry"
    export function reset() {
        X = 0;
        Y = 0;
        alphaRad = 0;
    }

    /**
     * Set position and orientation to specific values (angle in radians).
     * @param x X position in mm
     * @param y Y position in mm
     * @param angleRad Orientation in radians
     */
    //% block="set position (rad) to x: %x|y: %y|angle (rad): %angleRad"
    export function setPositionRad(x: number, y: number, angleRad: number) {
        X = x;
        Y = y;
        alphaRad = angleRad;
    }

    /**
     * Set position and orientation to specific values (angle in degrees).
     * @param x X position in mm
     * @param y Y position in mm
     * @param angleDeg Orientation in degrees
     */
    //% block="set position to x: %x|y: %y|angle (deg): %angleDeg"
    export function setPositionDeg(x: number, y: number, angleDeg: number) {
        X = x;
        Y = y;
        alphaRad = angleDeg * Math.PI / 180;
    }

    /**
     * Normalize angle to the range [-π, π]
     * @param angle Angle in radians to normalize
     * @returns Normalized angle in range [-π, π]
     */
    //% block="Normalize angle %angle to range [-π, π]"
    export function normalizeAngle(angle: number): number {
        let result = angle;
        while (result > Math.PI) {
            result -= 2 * Math.PI;
        }
        while (result <= -Math.PI) {
            result += 2 * Math.PI;
        }
        return result;
    }

    /**
     * Update odometry with new encoder values in mm
     * @param leftDeltaMm Left encoder delta in mm
     * @param rightDeltaMm Right encoder delta in mm
     */
    //% block="update with leftDelta: %leftDeltaMm|mm + rightDelta: %rightDeltaMm|mm"
    export function update(leftDeltaMm: number, rightDeltaMm: number) {
        // Calculate distance traveled and angle variation
        let deltaDist = (leftDeltaMm + rightDeltaMm) / 2;
        let diffCount = rightDeltaMm - leftDeltaMm;
        let deltaTheta = diffCount / entraxeInMM; // In radians

        if (Math.abs(diffCount) < 0.05) {
            // Movement is essentially straight (seuil 0.05 mm pour eviter la
            // bascule arc/segment a chaque cycle a cause du bruit de mesure,
            // tout en restant assez sensible aux petites courbures reelles)
            X += deltaDist * Math.cos(alphaRad);
            Y += deltaDist * Math.sin(alphaRad);
        } else {
            // Robot follows an arc
            // Calculate the radius of curvature
            let R = deltaDist / deltaTheta;

            // Update position
            X += R * (-Math.sin(alphaRad) + Math.sin(alphaRad + deltaTheta));
            Y += R * (Math.cos(alphaRad) - Math.cos(alphaRad + deltaTheta));

            // Update heading
            alphaRad += deltaTheta;

            // Normalize angle to [-π, π]
            alphaRad = normalizeAngle(alphaRad);
        }
    }

    /**
     * Update odometry with new encoder values in ticks
     * @param leftDeltaTicks Left encoder delta in ticks
     * @param rightDeltaTicks Right encoder delta in ticks
     */
    //% block="update with leftDelta: %leftDeltaTicks|ticks + rightDelta: %rightDeltaTicks|ticks"
    export function updateFromTicks(leftDeltaTicks: number, rightDeltaTicks: number) {
        // Convert ticks to mm
        let leftDeltaMm = leftDeltaTicks * 1000 / ticksPerMeter;
        let rightDeltaMm = rightDeltaTicks * 1000 / ticksPerMeter;

        // Call the regular update function
        update(leftDeltaMm, rightDeltaMm);
    }

    /**
     * Get current X position in mm
     */
    //% block="get X position (mm)"
    export function getX(): number {
        return X;
    }

    /**
     * Get current Y position in mm
     */
    //% block="get Y position (mm)"
    export function getY(): number {
        return Y;
    }

    /**
     * Get current orientation in radians
     */
    //% block="get orientation (radians)"
    export function getOrientationRad(): number {
        return alphaRad;
    }

    /**
     * Get current orientation in degrees
     */
    //% block="get orientation (degrees)"
    export function getOrientationDegrees(): number {
        return alphaRad * 180 / Math.PI;
    }

    /**
     * Calculate distance to a point
     * @param x X coordinate of the target point in mm
     * @param y Y coordinate of the target point in mm
     */
    //% block="distance to point x: %x|y: %y"
    export function distanceTo(x: number, y: number): number {
        let dx = x - X;
        let dy = y - Y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Calculate angle in radians to a point (relative to current orientation)
     * @param x X coordinate of the target point in mm
     * @param y Y coordinate of the target point in mm
     */
    //% block="angle to point x: %x|y: %y"
    export function angleTo(x: number, y: number): number {
        let dx2 = x - X;
        let dy2 = y - Y;
        let targetAngle = Math.atan2(dy2, dx2);

        // Calculate the difference and normalize to [-π, π]
        let angleDiff = targetAngle - alphaRad;
        return normalizeAngle(angleDiff);
    }




    /**
     * Afficher position actuelle
     */
    //% block="afficher position odométrie"
    export function showPosition(): void {
        basic.showString("X:" + Math.round(X));
        basic.pause(1000);
        basic.showString("Y:" + Math.round(Y));
        basic.pause(1000);
        basic.showString("A:" + Math.round(getOrientationDegrees()));
    }


}


// =====================================================================
// Asserv polaire continu (style asserv_chibios simplifié pour micro:bit)
// =====================================================================
// Usage minimal :
//   asserv.configureLeftMotor((pwm) => servos.P1.run(0 - pwm))
//   asserv.configureRightMotor((pwm) => servos.P2.run(pwm))
//   asserv.configureEncoders(() => enc.getDeltaLeftValue(), () => enc.getDeltaRightValue())
//   asserv.configureGeometry(100, 130000)
//   asserv.start()
//   asserv.avancer(200)   // bloquant
//   asserv.tourner(90)
//   asserv.goTo(200, 200)
//
// Architecture :
//   - basic.forever interne à 50 Hz (PERIOD_MS=20 par défaut)
//   - Trajectory generator trapézoïdal (accel/cruise/decel) sur dist + angle
//   - PID complet (P + I + D-on-measurement + Feed-Forward) sur chaque axe
//   - Mixage final motor_L = out_d - out_a, motor_R = out_d + out_a (clampé ±100)
//   - Pause/resume pour gérer détection obstacle externe sans perdre la cible
//% weight=99 color=#2d8659 icon="" block="Asserv polaire"
//% groups=['Configuration', 'Mouvement', 'Position', 'Controle']
namespace asserv {
    // === Etat (cumulé depuis start ou resetPosition) ===
    let pos_dist = 0
    let pos_angle = 0
    let pos_x = 0
    let pos_y = 0

    // === Trajectory generator state ===
    let consigne_dist = 0
    let consigne_angle = 0
    let target_dist = 0
    let target_angle = 0
    let vit_dist = 0
    let vit_angle = 0

    // === PID memoires ===
    let integral_d = 0
    let integral_a = 0
    // (Plus de variables de zone : le deadband est simple, calcule directement dans la boucle PID
    // a partir de |target - pos| <= TOL.)

    // === Etat operationnel ===
    let started = false
    let paused = false

    // === Parametres avec valeurs par defaut sensibles ===
    let KP_DIST = 1
    let KI_DIST = 0.2
    let KD_DIST = 3
    let KFF_DIST = 0.45
    let KP_ANGLE = 3
    let KI_ANGLE = 0.5
    let KD_ANGLE = 1
    let KFF_ANGLE = 0.4
    let VMAX_DIST = 200
    let ACCEL_DIST = 600
    let VMAX_ANGLE = 200
    let ACCEL_ANGLE = 400
    let TOL_DIST = 10
    let TOL_ANGLE = 3
    let PERIOD_MS = 20
    let INTEGRAL_MAX = 30
    let invertAngleMix = false
    let ENTRAXE_MM = 100
    let TICKS_PAR_METRE = 130000
    let MOVE_TIMEOUT_MS = 8000

    // === Callbacks hardware ===
    let leftMotorFn: (pwm: number) => void = null
    let rightMotorFn: (pwm: number) => void = null
    let getDeltaLeftFn: () => number = null
    let getDeltaRightFn: () => number = null
    let updateEncodersFn: () => void = null

    // === Configuration callbacks hardware ===

    /**
     * Definit la fonction qui pilote le moteur gauche (PWM -100..+100)
     */
    //% block="configurer moteur gauche"
    //% group="Configuration"
    //% weight=100
    //% handlerStatement=1
    export function configureLeftMotor(handler: (pwm: number) => void): void {
        leftMotorFn = handler as any as ((pwm: number) => void)
    }

    /**
     * Definit la fonction qui pilote le moteur droit (PWM -100..+100)
     */
    //% block="configurer moteur droit"
    //% group="Configuration"
    //% weight=99
    //% handlerStatement=1
    export function configureRightMotor(handler: (pwm: number) => void): void {
        rightMotorFn = handler as any as ((pwm: number) => void)
    }

    /**
     * Definit la fonction qui retourne le delta de ticks encodeur GAUCHE depuis le dernier appel
     */
    //% block="configurer encodeur gauche"
    //% group="Configuration"
    //% weight=98
    //% handlerStatement=1
    export function configureLeftEncoder(handler: () => void): void {
        getDeltaLeftFn = handler as any as (() => number)
    }

    /**
     * Definit la fonction qui retourne le delta de ticks encodeur DROIT depuis le dernier appel
     */
    //% block="configurer encodeur droit"
    //% group="Configuration"
    //% weight=97
    //% handlerStatement=1
    export function configureRightEncoder(handler: () => void): void {
        getDeltaRightFn = handler as any as (() => number)
    }

    /**
     * Optionnel : callback appele a chaque cycle d'asserv AVANT de lire les deltas.
     * Necessaire pour les libs encodeurs qui requierent un appel explicite (ex: MagEncoders.getValues()).
     */
    //% block="configurer update encodeurs"
    //% group="Configuration"
    //% weight=97
    //% handlerStatement=1
    export function configureEncoderUpdate(handler: () => void): void {
        updateEncodersFn = handler as any as (() => void)
    }

    /**
     * Geometrie du robot : entraxe (mm) entre les 2 roues, calibration ticks par metre lineaire.
     */
    //% block="configurer geometrie entraxe %entraxeMm mm | %ticksPerMeter ticks/m"
    //% group="Configuration"
    //% weight=97
    export function configureGeometry(entraxeMm: number, ticksPerMeter: number): void {
        ENTRAXE_MM = entraxeMm
        TICKS_PAR_METRE = ticksPerMeter
    }

    // === Parameter setters ===

    //% block="PID dist Kp %kp Ki %ki Kd %kd KFF %kff"
    //% group="Configuration"
    //% weight=80
    export function setPidDist(kp: number, ki: number, kd: number, kff: number): void {
        KP_DIST = kp; KI_DIST = ki; KD_DIST = kd; KFF_DIST = kff
    }

    //% block="PID angle Kp %kp Ki %ki Kd %kd KFF %kff"
    //% group="Configuration"
    //% weight=79
    export function setPidAngle(kp: number, ki: number, kd: number, kff: number): void {
        KP_ANGLE = kp; KI_ANGLE = ki; KD_ANGLE = kd; KFF_ANGLE = kff
    }

    //% block="vitesse max dist %vmaxDist mm/s | angle %vmaxAngle deg/s"
    //% group="Configuration"
    //% weight=78
    export function setMaxVelocity(vmaxDist: number, vmaxAngle: number): void {
        VMAX_DIST = vmaxDist; VMAX_ANGLE = vmaxAngle
    }

    //% block="acceleration max dist %accelDist mm/s² | angle %accelAngle deg/s²"
    //% group="Configuration"
    //% weight=77
    export function setMaxAcceleration(accelDist: number, accelAngle: number): void {
        ACCEL_DIST = accelDist; ACCEL_ANGLE = accelAngle
    }

    //% block="tolerances arrivee dist %tolDist mm | angle %tolAngle deg"
    //% group="Configuration"
    //% weight=76
    export function setTolerances(tolDist: number, tolAngle: number): void {
        TOL_DIST = tolDist; TOL_ANGLE = tolAngle
    }

    //% block="periode controle %periodMs ms"
    //% group="Configuration"
    //% weight=75
    export function setControlPeriod(periodMs: number): void {
        PERIOD_MS = periodMs
    }

    //% block="inverser mixage angle %invert"
    //% group="Configuration"
    //% weight=74
    export function setInvertAngleMix(invert: boolean): void {
        invertAngleMix = invert
    }

    //% block="timeout mouvement %timeoutMs ms"
    //% group="Configuration"
    //% weight=73
    export function setMoveTimeout(timeoutMs: number): void {
        MOVE_TIMEOUT_MS = timeoutMs
    }

    // === Controle (start/stop/pause/resume) ===

    /**
     * Demarre la boucle d'asserv (basic.forever interne).
     * A appeler une seule fois apres avoir configure les callbacks et parametres.
     */
    //% block="demarrer asserv"
    //% group="Controle"
    //% weight=100
    export function start(): void {
        if (started) return
        started = true
        paused = false
        // Reset state
        pos_dist = 0; pos_angle = 0; pos_x = 0; pos_y = 0
        consigne_dist = 0; consigne_angle = 0
        target_dist = 0; target_angle = 0
        vit_dist = 0; vit_angle = 0
        integral_d = 0; integral_a = 0
        basic.forever(function () {
            asservLoop()
        })
    }

    /**
     * Met l'asserv en pause : moteurs OFF, trajectoire figee. Utile pendant detection obstacle.
     */
    //% block="pause asserv"
    //% group="Controle"
    //% weight=90
    export function pauseAsserv(): void {
        paused = true
    }

    /**
     * Reprend l'asserv apres pause. Re-aligne consigne sur position actuelle pour eviter le recul.
     */
    //% block="reprendre asserv"
    //% group="Controle"
    //% weight=89
    export function resumeAsserv(): void {
        if (!paused) return
        consigne_dist = pos_dist
        consigne_angle = pos_angle
        target_dist = pos_dist
        target_angle = pos_angle
        vit_dist = 0; vit_angle = 0
        integral_d = 0; integral_a = 0
        paused = false
    }

    /**
     * Stop d'urgence : coupe les moteurs immediatement et annule la trajectoire en cours.
     */
    //% block="stop urgence"
    //% group="Controle"
    //% weight=80
    export function stopEmergency(): void {
        if (leftMotorFn != null) leftMotorFn(0)
        if (rightMotorFn != null) rightMotorFn(0)
        target_dist = pos_dist
        target_angle = pos_angle
        consigne_dist = pos_dist
        consigne_angle = pos_angle
        vit_dist = 0; vit_angle = 0
        integral_d = 0; integral_a = 0
    }

    //% block="asserv en pause ?"
    //% group="Controle"
    //% weight=70
    export function isPaused(): boolean {
        return paused
    }

    // === Movement primitives (bloquantes) ===

    /**
     * Avance d'une distance donnee en mm. Sortie des que pos dans TOL_DIST de la cible
     * (sans attendre que la consigne plateau, pour permettre le chainage smooth des moves).
     */
    //% block="avancer %distMm mm"
    //% group="Mouvement"
    //% weight=100
    export function avancer(distMm: number): void {
        target_dist = pos_dist + distMm
        integral_d = 0
        let timeoutAt = input.runningTime() + MOVE_TIMEOUT_MS
        while (input.runningTime() < timeoutAt) {
            if (Math.abs(pos_dist - target_dist) <= TOL_DIST) {
                break;
            }
            basic.pause(20)
        }
    }

    /**
     * Pivot sur place de deltaDeg degres (positif = gauche / CCW).
     * Sortie des que pos_angle dans TOL_ANGLE de la cible (chainage smooth comme avancer).
     */
    //% block="tourner %deltaDeg deg"
    //% group="Mouvement"
    //% weight=99
    export function tourner(deltaDeg: number): void {
        target_angle = pos_angle + deltaDeg
        integral_a = 0
        let timeoutAt = input.runningTime() + MOVE_TIMEOUT_MS
        while (input.runningTime() < timeoutAt) {
            if (Math.abs(pos_angle - target_angle) <= TOL_ANGLE) {
                break;
            }
            basic.pause(20)
        }
    }

    // === Waypoint sequencing (path-following bloquant) ===
    let waypoints: number[][] = []

    /**
     * Ajoute un point de passage (mm) a la liste pour runWaypoints().
     */
    //% block="ajouter waypoint x %x mm | y %y mm"
    //% group="Mouvement"
    //% weight=70
    export function addWaypoint(x: number, y: number): void {
        waypoints.push([x, y])
    }

    /**
     * Vide la liste de waypoints.
     */
    //% block="vider waypoints"
    //% group="Mouvement"
    //% weight=69
    export function clearWaypoints(): void {
        waypoints = []
    }

    /**
     * Combien de waypoints en attente.
     */
    //% block="nombre waypoints"
    //% group="Mouvement"
    //% weight=68
    export function getWaypointCount(): number {
        return waypoints.length
    }

    /**
     * Execute la sequence de waypoints en bloquant : pour chaque waypoint, tourne puis avance.
     */
    //% block="executer waypoints"
    //% group="Mouvement"
    //% weight=67
    export function runWaypoints(): void {
        for (let i = 0; i < waypoints.length; i++) {
            goTo(waypoints[i][0], waypoints[i][1])
        }
    }

    /**
     * Va au point cartesien (x, y) en mm : tourne vers le point puis avance.
     */
    //% block="aller a x %x mm | y %y mm"
    //% group="Mouvement"
    //% weight=98
    export function goTo(x: number, y: number): void {
        let dx = x - pos_x
        let dy = y - pos_y
        let targetAbsAngle = Math.atan2(dy, dx) * 180 / Math.PI
        let delta = targetAbsAngle - pos_angle
        while (delta > 180) {
            delta = delta - 360
        }
        while (delta < -180) {
            delta = delta + 360
        }
        tourner(delta)
        avancer(Math.sqrt(dx * dx + dy * dy))
    }

    // === Position getters (pour debug/log) ===

    //% block="position X (mm)" group="Position" weight=100
    export function getPosX(): number { return pos_x }

    //% block="position Y (mm)" group="Position" weight=99
    export function getPosY(): number { return pos_y }

    //% block="distance cumulee (mm)" group="Position" weight=98
    export function getPosDist(): number { return pos_dist }

    //% block="cap (deg)" group="Position" weight=97
    export function getPosAngle(): number { return pos_angle }

    //% block="consigne distance" group="Position" weight=80
    export function getConsigneDist(): number { return consigne_dist }

    //% block="consigne angle" group="Position" weight=79
    export function getConsigneAngle(): number { return consigne_angle }

    /**
     * Reset la position integree a (0, 0, 0).
     */
    //% block="reset position (0, 0, 0)"
    //% group="Position"
    //% weight=70
    export function resetPosition(): void {
        pos_x = 0; pos_y = 0; pos_dist = 0; pos_angle = 0
        consigne_dist = 0; consigne_angle = 0
        target_dist = 0; target_angle = 0
        vit_dist = 0; vit_angle = 0
        integral_d = 0; integral_a = 0
    }

    // === Boucle d'asserv interne (appelee par basic.forever a chaque PERIOD_MS) ===
    function asservLoop(): void {
        if (getDeltaLeftFn == null || getDeltaRightFn == null) {
            basic.pause(PERIOD_MS)
            return
        }

        // 1. Update encoders (pour libs qui requierent un appel explicite type MagEncoders.getValues())
        if (updateEncodersFn != null) {
            updateEncodersFn()
        }
        // Puis lecture deltas + integration polaire
        let dL = getDeltaLeftFn()
        let dR = getDeltaRightFn()
        let dDist = (dL + dR) * 0.5 * 1000 / TICKS_PAR_METRE
        let dAngleDeg = (dR - dL) * 1000 / TICKS_PAR_METRE / ENTRAXE_MM * 180 / Math.PI
        pos_dist = pos_dist + dDist
        pos_angle = pos_angle + dAngleDeg
        pos_x = pos_x + dDist * Math.cos(pos_angle * Math.PI / 180)
        pos_y = pos_y + dDist * Math.sin(pos_angle * Math.PI / 180)

        if (paused) {
            if (leftMotorFn != null) leftMotorFn(0)
            if (rightMotorFn != null) rightMotorFn(0)
            basic.pause(PERIOD_MS)
            return
        }

        // 2. Trajectory generator distance
        let restant_d = target_dist - consigne_dist
        if (Math.abs(restant_d) > 0.1) {
            let sens_d = restant_d >= 0 ? 1 : -1
            let v_brake_d = Math.sqrt(2 * ACCEL_DIST * Math.abs(restant_d))
            let v_target_d = sens_d * Math.min(VMAX_DIST, v_brake_d)
            let dv_d = v_target_d - vit_dist
            let dv_max_d = ACCEL_DIST * PERIOD_MS / 1000
            if (Math.abs(dv_d) > dv_max_d) {
                dv_d = dv_max_d * (dv_d >= 0 ? 1 : -1)
            }
            vit_dist = vit_dist + dv_d
            consigne_dist = consigne_dist + vit_dist * PERIOD_MS / 1000
        } else {
            consigne_dist = target_dist
            vit_dist = 0
        }

        // 3. Trajectory generator angle
        let restant_a = target_angle - consigne_angle
        if (Math.abs(restant_a) > 0.1) {
            let sens_a = restant_a >= 0 ? 1 : -1
            let v_brake_a = Math.sqrt(2 * ACCEL_ANGLE * Math.abs(restant_a))
            let v_target_a = sens_a * Math.min(VMAX_ANGLE, v_brake_a)
            let dv_a = v_target_a - vit_angle
            let dv_max_a = ACCEL_ANGLE * PERIOD_MS / 1000
            if (Math.abs(dv_a) > dv_max_a) {
                dv_a = dv_max_a * (dv_a >= 0 ? 1 : -1)
            }
            vit_angle = vit_angle + dv_a
            consigne_angle = consigne_angle + vit_angle * PERIOD_MS / 1000
        } else {
            consigne_angle = target_angle
            vit_angle = 0
        }

        // 4. PID distance avec integrale anti-windup et D-on-measurement
        // err_d = ecart entre consigne (trajectoire) et pos (mesuree)
        let err_d = consigne_dist - pos_dist
        integral_d = integral_d + err_d * PERIOD_MS / 1000
        if (integral_d > INTEGRAL_MAX) integral_d = INTEGRAL_MAX
        if (integral_d < 0 - INTEGRAL_MAX) integral_d = 0 - INTEGRAL_MAX
        // Deadband simple : si pos dans TOL de target, motors a 0. PID re-engage si pos sort.
        let out_d = 0
        if (Math.abs(target_dist - pos_dist) > TOL_DIST) {
            out_d = KP_DIST * err_d + KI_DIST * integral_d - KD_DIST * dDist + KFF_DIST * vit_dist
        }

        // 5. PID angle (erreur normalisee dans [-180, 180])
        let err_a = consigne_angle - pos_angle
        while (err_a > 180) {
            err_a = err_a - 360
        }
        while (err_a < -180) {
            err_a = err_a + 360
        }
        // Deadband simple angle
        let err_target_a = target_angle - pos_angle
        while (err_target_a > 180) err_target_a = err_target_a - 360
        while (err_target_a < -180) err_target_a = err_target_a + 360
        integral_a = integral_a + err_a * PERIOD_MS / 1000
        if (integral_a > INTEGRAL_MAX) integral_a = INTEGRAL_MAX
        if (integral_a < 0 - INTEGRAL_MAX) integral_a = 0 - INTEGRAL_MAX
        let out_a = 0
        if (Math.abs(err_target_a) > TOL_ANGLE) {
            out_a = KP_ANGLE * err_a + KI_ANGLE * integral_a - KD_ANGLE * dAngleDeg + KFF_ANGLE * vit_angle
            if (invertAngleMix) {
                out_a = 0 - out_a
            }
        }

        // 6. Mixage gauche/droite + clamp + apply
        let vL = out_d - out_a
        let vR = out_d + out_a
        if (vL > 100) vL = 100
        if (vL < -100) vL = -100
        if (vR > 100) vR = 100
        if (vR < -100) vR = -100
        if (leftMotorFn != null) leftMotorFn(vL)
        if (rightMotorFn != null) rightMotorFn(vR)

        basic.pause(PERIOD_MS)
    }
}
