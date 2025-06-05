/**
 * Robot Navigator Extension - Compatible MakeCode micro:bit
 * Navigation autonome avec correction vectorielle
 * Configuration par référencement de fonctions existantes
 * 
 * Copiez ce code dans main.ts de votre projet MakeCode
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
    let configurationComplete = false

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


    /**
     * Vérifier si la configuration est complète
     */
    //% block="configuration complète ?"
    //% group="Configuration"
    //% weight=89
    export function isConfigurationComplete(): boolean {
        return configurationComplete;
    }

    /**
     * Tester la configuration
     */
    //% block="tester configuration"
    //% group="Configuration"
    //% weight=88
    export function testConfiguration(): void {
        if (configurationComplete) {
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

    // Fonction interne pour vérifier la configuration
    function checkConfiguration(): void {
        configurationComplete = (
            getXFunction != null &&
            getYFunction != null &&
            getAngleDegFunction != null &&
            leftMotorFunction != null &&
            rightMotorFunction != null &&
            stopMotorFunction != null
        );

        if (configurationComplete) {
            basic.showIcon(IconNames.Yes);
            basic.pause(500);
            basic.clearScreen();
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
        if (!configurationComplete) {
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
    //% block="tolérance angle $tolerance°"
    //% group="Paramètres"
    //% weight=68
    //% tolerance.defl=10
    export function setAngleTolerance(tolerance: number): void {
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
        if (configurationComplete) {
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
    //% block="angle actuel"
    //% group="Debug"
    //% weight=56
    export function getCurrentAngle(): number {
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
        if (configurationComplete && waypoints.length > 0 && currentWaypoint < waypoints.length) {
            let target = waypoints[currentWaypoint];
            let currentX = getXFunction();
            let currentY = getYFunction();
            return calculateDistance(currentX, currentY, target[0], target[1]);
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
        if (navigationActive && waypoints.length > 0 && configurationComplete) {
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
     * Set position and orientation to specific values
     * @param x X position in mm
     * @param y Y position in mm
     * @param angle Orientation in radians
     */
    //% block="set position to x: %x|y: %y|angle: %angle"
    export function setPosition(x: number, y: number, anglerad: number) {
        X = x;
        Y = y;
        alphaRad = anglerad;
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

        if (Math.abs(diffCount) < 0.001) {
            // Movement is essentially straight
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


    /**
     * Example of how to set up a continuous odometry update
     * Call this from your main program, not used directly by RobotMovement
     * @param leftDeltaProvider Function to get left encoder delta (in ticks)
     * @param rightDeltaProvider Function to get right encoder delta (in ticks)
     */
    //% block="Start odometry update loop with %leftDeltaProvider and %rightDeltaProvider"
    //% draggableParameters="reporter"
    //% weight=40
    export function startOdometryUpdateLoop(
        leftDeltaProvider: () => number,
        rightDeltaProvider: () => number
    ): void {
        // Create a background loop to update odometry every 50ms
        control.inBackground(() => {
            while (true) {
                // Get deltas from encoders
                const leftDelta = leftDeltaProvider();
                const rightDelta = rightDeltaProvider();
                // Update odometry
                odometry.updateFromTicks(leftDelta, rightDelta);
                // Wait for next update cycle
                basic.pause(50);
            }
        });
    }
}