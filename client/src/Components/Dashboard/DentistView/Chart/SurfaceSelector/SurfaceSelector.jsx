import PropTypes from "prop-types";
import { useState } from "react";
import { useEffect } from "react";

/**
 * Component to allow the user to select tooth surfaces.
 * 
 * @author Team
 */
export default function SurfaceSelector({ selectedSurfaces, setSelectedSurfaces, selectedTooth }) {
    const [topFaceName, setTopFaceName] = useState("incisal");
    const [topFaceLabel, setTopFaceLabel] = useState("I");

    const [upperFaceName, setUpperFaceName] = useState("incisal");
    const [upperFaceLabel, setUpperFaceLabel] = useState("I");

    const [leftFaceName, setLeftFaceName] = useState("distal");
    const [leftFaceLabel, setLeftFaceLabel] = useState("D");

    const [rightFaceName, setRightFaceName] = useState("mesial");
    const [rightFaceLabel, setRightFaceLabel] = useState("M");

    // Select / deselect clicked surfaces
    function handleSurfaceSelected(surface) {
        let updated;

        if (selectedSurfaces.includes(surface)) {
            updated = selectedSurfaces.filter(s => s !== surface);
        } else {
            updated = [...selectedSurfaces, surface];
        }

        setSelectedSurfaces(updated);
    }

    // Change between incisal and occlusal when molars/incisors are selected
    useEffect(() => {
        // Fore or aft
        if (selectedTooth[3] < 4) {
            setTopFaceLabel("I")
            setTopFaceName("incisal")
            setSelectedSurfaces(selectedSurfaces.filter(s => s !== "occlusal"))
        }
        else {
            setTopFaceLabel("O")
            setTopFaceName("occlusal")
            setSelectedSurfaces(selectedSurfaces.filter(s => s !== "incisal"))
        }

        // Left or right
        if (['1', '4', '5', '8'].includes(selectedTooth[2])) {
            setLeftFaceLabel('D');
            setLeftFaceName('distal');
            setRightFaceLabel('M');
            setRightFaceName('mesial');
        }
        else {
            setLeftFaceLabel('M');
            setLeftFaceName('mesial');
            setRightFaceLabel('D');
            setRightFaceName('distal');
        }

        // Top or bottom
        if (['1', '2', '5', '6'].includes(selectedTooth[2])) {
            setUpperFaceName('palatal');
            setUpperFaceLabel('P');
        }
        else {
            setUpperFaceName('lingual');
            setUpperFaceLabel('L');
        }
    }, [selectedTooth]);

    const isSelected = (surface) => selectedSurfaces.includes(surface);

    return (
        <div className="h-full">
            <h4 className="text-center pt-2 mb-0">Select Tooth Surfaces</h4>
            <div className="flex justify-center items-center" style={{height: '100%'}}>
                <div className="grid grid-cols-5 grid-rows-5 gap-2 place-items-center w-full h-full">
                    {Array.from({ length: 25 }, (_, index) => {
                        const row = Math.floor(index / 5);
                        const col = index % 5;
                        const realButtons = {
                            '1-2': { id: upperFaceName, label: upperFaceLabel },
                            '2-1': { id: leftFaceName, label: leftFaceLabel },
                            '2-2': { id: topFaceName, label: topFaceLabel },
                            '2-3': { id: rightFaceName, label: rightFaceLabel },
                            '3-2': { id: "buccal", label: "B" }
                        };

                        const key = `${row}-${col}`;
                        if (realButtons[key]) {
                            const { id, label } = realButtons[key];
                            return (
                                <button
                                    key={index}
                                    id={id}
                                    onClick={() => handleSurfaceSelected(id)}
                                    className={isSelected(id) ? "btn-surface-selected" : "btn-surface"}
                                >
                                    {label}
                                </button>
                            );
                        }

                        // filler button
                        return (
                            <button
                                key={index}
                                className="btn-filler"
                            >

                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    )
}

SurfaceSelector.propTypes = {
    selectedSurfaces: PropTypes.arrayOf(PropTypes.string).isRequired,
    setSelectedSurfaces: PropTypes.func.isRequired,
    selectedTooth: PropTypes.string.isRequired
}