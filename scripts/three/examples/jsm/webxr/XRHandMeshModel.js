import { GLTFLoader } from '/node_modules/three/examples/jsm/loaders/GLTFLoader.js';

const DEFAULT_HAND_PROFILE_PATH = 'https://cdn.jsdelivr.net/npm/@webxr-input-profiles/assets@1.0/dist/profiles/generic-hand/';

class XRHandMeshModel {

	constructor( handModel, xrInputSource, path, handedness, loader = null ) {

		this.xrInputSource = xrInputSource;
		this.handModel = handModel;

		this.bones = [];

		if ( loader === null ) {

			loader = new GLTFLoader();
			loader.setPath( path || DEFAULT_HAND_PROFILE_PATH );

		}

		loader.load( `${handedness}.glb`, gltf => {

			const object = gltf.scene.children[ 0 ];
			this.handModel.add( object );
            this.assetUrl = DEFAULT_HAND_PROFILE_PATH + `${handedness}.glb`;

			const mesh = object.getObjectByProperty( 'type', 'SkinnedMesh' );
			mesh.frustumCulled = false;
			mesh.castShadow = true;
			mesh.receiveShadow = true;

			const joints = [
				'wrist',
				'thumb-metacarpal',
				'thumb-phalanx-proximal',
				'thumb-phalanx-distal',
				'thumb-tip',
				'index-finger-metacarpal',
				'index-finger-phalanx-proximal',
				'index-finger-phalanx-intermediate',
				'index-finger-phalanx-distal',
				'index-finger-tip',
				'middle-finger-metacarpal',
				'middle-finger-phalanx-proximal',
				'middle-finger-phalanx-intermediate',
				'middle-finger-phalanx-distal',
				'middle-finger-tip',
				'ring-finger-metacarpal',
				'ring-finger-phalanx-proximal',
				'ring-finger-phalanx-intermediate',
				'ring-finger-phalanx-distal',
				'ring-finger-tip',
				'pinky-finger-metacarpal',
				'pinky-finger-phalanx-proximal',
				'pinky-finger-phalanx-intermediate',
				'pinky-finger-phalanx-distal',
				'pinky-finger-tip',
			];

			joints.forEach( jointName => {

				const bone = object.getObjectByName( jointName );

				if ( bone !== undefined ) {

					bone.jointName = jointName;

				} else {

					console.warn( `Couldn't find ${jointName} in ${handedness} hand mesh` );

				}

				this.bones.push( bone );

			} );

		} );

	}

	updateMesh(frame, referenceSpace, parentMatrix) {
        if(!parentMatrix) return;
        parentMatrix = parentMatrix.clone().invert();
        let i = 0;
        for(let joint of this.xrInputSource.hand.values()) {
            let bone = this.bones[i];
            let jointPose = frame.getJointPose(joint, referenceSpace);
			if(bone && jointPose) {
                bone.matrix.fromArray(jointPose.transform.matrix)
                    .premultiply(parentMatrix);
                bone.matrix.decompose(bone.position, bone.rotation, bone.scale);
			}
            i++;
		}

	}

}

export { XRHandMeshModel };