import {
	Dispatch,
	FC,
	MutableRefObject,
	RefObject,
	SetStateAction,
	Suspense,
} from "react";
import * as THREE from "three";
import {
	Html,
	OrbitControls,
	PerspectiveCamera,
	View,
} from "@react-three/drei";

import { OrbitControls as OrbitControlsImpl } from "three-stdlib";

import { PhoneModel } from "../types/consts.types";
import Lights from "./Lights";
import IPhone from "./iPhone";
import Loader from "./Loader";

interface ModelViewProps {
	index: number;
	groupRef: MutableRefObject<THREE.Group>;
	controlRef: RefObject<OrbitControlsImpl>;
	setRotationState: Dispatch<SetStateAction<number>>;
	gsapType: string;
	item: Omit<PhoneModel, "id">;
	size: "small" | "large";
}

const ModelView: FC<ModelViewProps> = ({
	index,
	groupRef,
	controlRef,
	gsapType,
	setRotationState,
	item,
	size,
}) => {
	return (
		<View
			index={index}
			id={gsapType}
			className={`w-full h-full absolute 
				${index === 2 ? "right-[-100%]" : ""}`}
		>
			<ambientLight intensity={0.3} />
			<PerspectiveCamera
				makeDefault
				position={[0, 0, 4]}
			/>

			<Lights />

			<OrbitControls
				makeDefault
				ref={controlRef}
				enableZoom={false}
				enablePan={false}
				rotateSpeed={0.4}
				target={new THREE.Vector3(0, 0, 0)}
				onEnd={() =>
					controlRef.current &&
					setRotationState(controlRef.current.getAzimuthalAngle())
				}
			/>

			<group
				ref={groupRef}
				name={`${index === 1 ? "small" : "large"}`}
				position={[0, 0, 0]}
			>
				<Suspense fallback={<Loader />}>
					<IPhone
						scale={index === 1 ? [15, 15, 15] : [17, 17, 17]}
						item={item}
						size={size}
					/>
				</Suspense>
			</group>
		</View>
	);
};

export default ModelView;
