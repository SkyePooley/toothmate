import { Suspense, useState } from 'react'; // Import hooks
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import PropTypes from 'prop-types'; // Import PropTypes

import MouthCanvas from './MouthCanvas';
import { useRef } from 'react';
import ChartOptions from './ChartOptions';
import XrayHistory from '../../XrayHistory/XrayHistory';


/**
 * Container for MouthCanvas
 * 
 * Provides controls for chart viewer.
 * Specifies lighting and camera details for 3D model rendering.
 * 
 * @author Team
 */
export default function MouthManager({patient, onToothSelected}) {
    // Change state to hold an array of selected teeth
    const [selectedTooth, setselectedTooth] = useState();
    const [view, setView] = useState("grid");
    const [is3DView, setIs3DView] = useState(false);
    const controlsRef = useRef(); // Allows programatic control of camera.
    const [treatmentVisibility, setTreatmentVisibility] = useState({
        all: true,
        filling: true,
        crown: true,
        rootCanal: true,
        extraction: true,
        implant: true,
        veneer: true,
        sealant: true
    });
    const [conditionVisibility, setConditionVisibility] = useState({
        all: true,
        erosion: true,
        partialEruption: true,
        acidWear: true,
        bruxism: true,
        grooving: true,
        discolouration: true,
        fracture: true
    });
    const [showOptions, setShowOptions] = useState(true);
    const toggleOptions = () => setShowOptions(!showOptions);

    const setToothSelection = (selection) => {
        setselectedTooth(selection);
        onToothSelected(selection);
    }

    // Select / Deselect teeth when clicked.
    const handleMeshClick = (meshName) => {
        if (selectedTooth === meshName) {
            setToothSelection(null);
        }
        else {
            setToothSelection(meshName);
        }
    }

    function handleViewChanged(newView) {
        setView(newView);
        setIs3DView(newView === "mouth");
        resetView();
    }

    function resetView() {
        if (controlsRef.current) {
            controlsRef.current.reset();
        }
        else {
            console.log("Unable to reset view. OrbitControls reference lost!");
        }
    }

    const getSelectedRowCol = (selectedTooth) => {
        return {
            row: selectedTooth[2], // t_[2]6
            col: selectedTooth[3]  // t_2[6]
        }
    }

    // Chart keyboard navigation
    const handleKeyPress = (event) => {
        const key = event.key;
        if (key === "Escape") { setToothSelection(null); return; }
        if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(key)) { return; }
        if (selectedTooth == null) { setToothSelection("t_11"); return; }


        let row = getSelectedRowCol(selectedTooth).row;
        let col = getSelectedRowCol(selectedTooth).col;

        const decRow = () => {
            if (row === '1') {
                row = 4;
            }
            else if (row === '5') {
                row = 8;
            }
            else {
                row--;
            }
        }

        const incRow = () => {
            if (row === '4') { row = 1; }
            else if (row === '8') { row = 5; }
            else { row++;}
        }

        const decCol = () => {
            if (col > 1) { col--; }
            else {
                decRow();
                if (row > 4) { col = 5; }
                else { col = 8; }
            }
        }

        const incCol = () => {
            if ((row < 5 && col < 8) || (row > 4 && col < 5)) { col++; }
            else {
                incRow();
                col = 1;
            }
        }

        if (key === "ArrowLeft") {
            decCol();
        }
        if (key === "ArrowUp") {
            decRow();
        }
        if (key === "ArrowDown") {
            incRow();
        }
        if (key === "ArrowRight") {
            incCol();
        }

        setToothSelection(`t_${row}${col}`);
    }

    return (
        <div 
        onKeyDown={handleKeyPress}
        tabIndex={0} // Makes div focusable. Required to enable keypress capture.
        style={{ position: 'relative', height: '785px', width: '100%' }}>
            <div style={showOptions ? {height: '60%'} : {height: '93%'}}>
                {view!=="xray" ?
                <Canvas 
                    key={is3DView ? '3d' : 'ortho'} // Force remount on view change
                    style={{ height: '100%', width: '100%' }}
                    orthographic={!is3DView}
                    camera={
                        // Orthographic view switching requires changes to camera position.
                        is3DView ? {
                            fov: 80
                        } : {
                            zoom: 13
                        }
                    }
                >
                    <ambientLight intensity={1.5} />
                    <directionalLight position={[0, 10, 10]} intensity={3.0} />
                    <Suspense fallback={() => {}}>
                        <MouthCanvas
                            selectedTooth={selectedTooth}
                            onMeshClick={handleMeshClick}
                            patient={patient}
                            treatmentVisibility={treatmentVisibility}
                            conditionVisibility={conditionVisibility}
                            is3d={is3DView}
                        />
                    </Suspense>
                    <OrbitControls
                        ref={controlsRef}
                        enableZoom={true}
                        maxDistance={6}
                        minDistance={3}
                        enablePan={!is3DView}
                        minAzimuthAngle={-Math.PI / 2}
                        maxAzimuthAngle={Math.PI / 2}
                        minPolarAngle={Math.PI / 2.75}
                        maxPolarAngle={Math.PI / 1.75}
                        dampingFactor={0.2}
                        enableRotate={is3DView}
                    />
                </Canvas>
                :
                <div>
                    <XrayHistory patient={patient}/>
                </div>}
            </div>

            <div 
            style={showOptions? {height: '40%'} : {height: '7%'}}
            className='bottomcard'
            >

                <ChartOptions
                    treatmentVisibility={treatmentVisibility}
                    setTreatmentVisibility={setTreatmentVisibility}
                    conditionVisibility={conditionVisibility}
                    setConditionVisibility={setConditionVisibility}
                    view={view}
                    handleViewChanged={handleViewChanged}
                    resetView={resetView}
                    toggleVisibility={toggleOptions}
                    visibility={showOptions}
                />

            </div>
        </div>
    );
}

MouthManager.propTypes = {
    mouthData: PropTypes.object.isRequired,
    onToothSelected: PropTypes.func.isRequired,
    patient: PropTypes.shape({
        nhiNumber: PropTypes.string.isRequired,
        Treatments: PropTypes.arrayOf(
            PropTypes.shape({
            date: PropTypes.string.isRequired,
            procedure: PropTypes.string,
            notes: PropTypes.string,
            tooth: PropTypes.string 
            })
        ).isRequired
        }).isRequired,
}