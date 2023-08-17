/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import XRDevice from '/scripts/core/assets/XRDevice.js';
import Handedness from '/scripts/core/enums/Handedness.js';
import XRInputDeviceTypes from '/scripts/core/enums/XRInputDeviceTypes.js';
import InputHandler from '/scripts/core/handlers/InputHandler.js';
import LibraryHandler from '/scripts/core/handlers/LibraryHandler.js';
import ProjectHandler from '/scripts/core/handlers/ProjectHandler.js';
import { Euler, Quaternion, Raycaster, Vector3 } from 'three';

const DEFAULT_HAND_PROFILE_PATH = 'https://cdn.jsdelivr.net/npm/@webxr-input-profiles/assets@1.0/dist/profiles/generic-hand/';

export default class XRHand extends XRDevice {
    constructor(params = {}) {
        params['assetId'] = XRHand.assetId;
        super(params);
        this._handedness = params['handedness'];
        if(!this._handedness in Handedness) {
            throw new Error("hand must be LEFT or RIGHT");
        }
        let controllerModel = params['controllerModel'];
        if(controllerModel) {
            this._object.add(controllerModel);
            this._modelObject = controllerModel;
            this._modelUrl = DEFAULT_HAND_PROFILE_PATH
                + this._handedness.toLowerCase() + '.glb';
        }
        this._raycasterOrigin = new Vector3();
        this._raycasterDirection = new Vector3();
    }

    _registerOwner(params) {
        let owner = ProjectHandler.getSessionAsset(params['ownerId']);
        if(owner) {
            owner.registerXRHand(params['handedness'], this);
        }
    }

    exportParams() {
        let params = super.exportParams();
        params['handedness'] = this._handedness;
        return params;
    }

    getHandedness() {
        return this._handedness;
    }

    getRaycaster() {
        return null;
        let xrHand = InputHandler.getXRController(
            XRInputDeviceTypes.CONTROLLER, this._handedness, 'targetRay');
        if(!xrHand) return null;
        xrHand.getWorldPosition(this._raycasterOrigin);
        xrHand.getWorldDirection(this._raycasterDirection).negate()
            .normalize();
        return new Raycaster(this._raycasterOrigin, this._raycasterDirection,
            0.01, 50);
    }

    isButtonPressed(index) {
        return false;
        let gamepad = InputHandler.getXRGamepad(this._handedness);
        return gamepad != null && gamepad.buttons[index].pressed;
    }

    static assetId = 'd26f490e-dc3a-4f96-82d4-ab9f3bdb92b2';
    static assetName = 'XR Hand';
}

ProjectHandler.registerAsset(XRHand);
LibraryHandler.loadBuiltIn(XRHand);