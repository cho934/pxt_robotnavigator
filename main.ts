/**
 * Robot Navigator Extension
 * Navigation autonome avec correction vectorielle
 */

//% weight=100 color=#0fbc11 icon="\uf1b9" block="Robot Navigator"
//% groups=['Configuration', 'Navigation', 'Paramètres', 'Debug']
namespace robotNavigator {

    // Interfaces pour les callbacks
    export interface PositionProvider {
        getX: () => number;
        getY: () => number;
        getAngle: () => number;
    }

    export interface MotorController {
        forward: (speed: number) => void;
        turnLeft: (speed: number) => void;
        turnRight: (speed: number) => void;
        stop: () => void;
        setMotorSpeeds: (leftSpeed: number, rightSpeed: number) => void;
    }

    // Variables pour stocker les callbacks
    let positionProvider: PositionProvider = null;
    let motorController: MotorController = null;

    // Variables internes
    let vitesse = 50
    let tolerancePosition = 10
    let toleranceAngle = 10
    let correctionGain = 0.5
    let maxCorrection = 30
    let waypoints: number[][] = []
    let currentWaypoint = 0
    let navigationActive = false
    let correctionActive = true
    let lastError = 0

    /**
     * Configure les fonctions de position
     * @param getX fonction qui retourne la position X
     * @param getY fonction qui retourne la position Y
     * @param getAngle fonction qui retourne l'angle
     */
    //% block="configurer position avec|X $getX|Y $getY|angle $getAngle"
    //% group="Configuration"
    //% weight=100
    //% inlineInputMode=inline
    export function configurePosition(
        getX: () => number,
        getY: () => number,
        getAngle: () => number
    ): void {
        positionProvider = {
            getX: getX,
            getY: getY,
            getAngle: getAngle
        };
    }

    /**
     * Configure les fonctions moteur de base
     * @param forward fonction pour avancer
     * @param turnLeft fonction pour tourner à gauche
     * @param turnRight fonction pour tourner à droite
     * @param stop fonction pour arrêter
     */
    //% block="configurer moteurs|avancer $forward|gauche $turnLeft|droite $turnRight|stop $stop"
    //% group="Configuration"
    //% weight=99
    //% inlineInputMode=inline
    export function configureMotors(
        forward: (speed: number) => void,
        turnLeft: (speed: number) => void,
        turnRight: (speed: number) => void,
        stop: () => void
    ): void {
        motorController = {
            forward: forward,
            turnLeft: turnLeft,
            turnRight: turnRight,
            stop: stop,
            setMotorSpeeds: (left: number, right: number) => {
                // Par défaut, utilise les fonctions de base
                // Cette fonction sera écrasée si on utilise configureMotorsDifferential
                if (left > 0 && right > 0) {
                    forward(Math.min(left, right));
                } else if (left > right) {
                    turnLeft(left - right);
                } else if (right > left) {
                    turnRight(right - left);
                } else {
                    stop();
                }
            }
        };
    }

    /**
     * Configure les moteurs avec contrôle différentiel
     * @param setLeftSpeed fonction pour la vitesse du moteur gauche
     * @param setRightSpeed fonction pour la vitesse du moteur droit
     */
    //% block="configurer moteurs différentiels|gauche $setLeftSpeed|droite $setRightSpeed"
    //% group="Configuration"
    //% weight=98
    //% inlineInputMode=inline
    export function configureMotorsDifferential(
        setLeftSpeed: (speed: number) => void,
        setRightSpeed: (speed: number) => void
    ): void {
        if (!motorController) {
            motorController = {
                forward: (speed: number) => {
                    setLeftSpeed(speed);
                    setRightSpeed(speed);
                },
                turnLeft: (speed: number) => {
                    setLeftSpeed(0);
                    setRightSpeed(speed);
                },
                turnRight: (speed: number) => {
                    setLeftSpeed(speed);
                    setRightSpeed(0);
                },
                stop: () => {
                    setLeftSpeed(0);
                    setRightSpeed(0);
                },
                setMotorSpeeds: (left: number, right: number) => {
                    setLeftSpeed(left);
                    setRightSpeed(right);
                }
            };
        } else {
            motorController.setMotorSpeeds = (left: number, right: number) => {
                setLeftSpeed(left);
                setRightSpeed(right);
            };
        }
    }

    /**
     * Ajoute un point de passage
     */
    //% block="ajouter point x $x y $y"
    //% group="Navigation"
    //% weight=80
    //% x.defl=100 y.defl=100
    export function addWaypoint(x: number, y: number): void {
        waypoints.push([x, y]);
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
    }

    /**
     * Démarre la navigation
     */
    //% block="démarrer navigation"
    //% group="Navigation"
    //% weight=78
    export function startNavigation(): void {
        if (!positionProvider || !motorController) {
            basic.showString("ERR");
            return;
        }
        navigationActive = true;
        currentWaypoint = 0;
        lastError = 0;
    }

    /**
     * Arrête la navigation
     */
    //% block="arrêter navigation"
    //% group="Navigation"
    //% weight=77
    export function stopNavigation(): void {
        navigationActive = false;
        if (motorController) {
            motorController.stop();
        }
    }

    /**
     * Active la correction vectorielle
     */
    //% block="activer correction"
    //% group="Navigation"
    //% weight=76
    export function enableCorrection(): void {
        correctionActive = true;
    }

    /**
     * Désactive la correction vectorielle
     */
    //% block="désactiver correction"
    //% group="Navigation"
    //% weight=75
    export function disableCorrection(): void {
        correctionActive = false;
    }

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
        toleranceAngle = tolerance;
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
     * Affiche l'état
     */
    //% block="afficher état"
    //% group="Debug"
    //% weight=60
    export function showStatus(): void {
        if (navigationActive && waypoints.length > 0) {
            basic.showNumber(currentWaypoint + 1);
        } else {
            basic.showIcon(IconNames.No);
        }
    }

    // Fonctions internes
    function getPosition(): { x: number, y: number, angle: number } {
        if (!positionProvider) {
            return { x: 0, y: 0, angle: 0 };
        }
        return {
            x: positionProvider.getX(),
            y: positionProvider.getY(),
            angle: positionProvider.getAngle()
        };
    }

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
        let pos = getPosition();
        let distance = calculateDistance(pos.x, pos.y, targetX, targetY);

        if (distance <= tolerancePosition) {
            motorController.stop();
            return true;
        }

        let targetAngle = calculateTargetAngle(pos.x, pos.y, targetX, targetY);
        let angleDiff = normalizeAngleDifference(targetAngle - pos.angle);

        if (correctionActive && Math.abs(angleDiff) <= 45) {
            // Navigation avec correction vectorielle
            let lateralError = calculateLateralError(pos.x, pos.y, pos.angle, targetX, targetY);
            let normalizedError = lateralError / Math.max(distance, 10);
            let correction = normalizedError * correctionGain * 100;
            correction += (normalizedError - lastError) * 20;
            lastError = normalizedError;

            // Appliquer la correction
            correction = Math.constrain(correction, -maxCorrection, maxCorrection);
            let leftSpeed = Math.constrain(vitesse + correction, 0, 100);
            let rightSpeed = Math.constrain(vitesse - correction, 0, 100);
            motorController.setMotorSpeeds(leftSpeed, rightSpeed);
        } else if (Math.abs(angleDiff) > toleranceAngle) {
            // Rotation sur place
            if (angleDiff > 0) {
                motorController.turnRight(Math.min(vitesse, Math.abs(angleDiff)));
            } else {
                motorController.turnLeft(Math.min(vitesse, Math.abs(angleDiff)));
            }
        } else {
            // Avancer tout droit
            motorController.forward(vitesse);
        }

        return false;
    }

    // Boucle de navigation
    basic.forever(function () {
        if (navigationActive && waypoints.length > 0 && positionProvider && motorController) {
            let target = waypoints[currentWaypoint];

            if (navigateToPoint(target[0], target[1])) {
                basic.showIcon(IconNames.Yes);
                basic.pause(500);
                basic.clearScreen();
                currentWaypoint = (currentWaypoint + 1) % waypoints.length;
            }
        }
    });
}
