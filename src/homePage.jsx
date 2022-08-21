import React, { useEffect, useState } from "react"
import * as ReactDOM from "react-dom";
import Header from "./components/header"
import SettingsMenu from "./components/settingsMenu";
import {initAndGetSound, cookieInit} from "../dist/helper-js/cookieManager"
import "../dist/helper-js/join";
import { styleList } from "./helper-js/StyleManager";
import { GameMode, GameModes } from "../src/helper-js/GameModes"
import { goToGame } from "../dist/helper-js/utils";
import { computerTypes } from "../src/helper-js/EnemyComputerSettings"

export default function HomePage(props){

    const [customStyle, setCustomStyle] = useState(styleList[cookieInit() && globalThis.cookie.style] || styleList.oat)
    const [soundOn, setSoundToggle] = useState(initAndGetSound())

    const [gameMode, setGameMode] = useState(GameModes.SINGLE_PLAYER.modeName);
    const [roomID, setRoomID] = useState();
    const [timeLimit, setTimeLimit] = useState(15)
    const [AILevel, setAILevel] = useState(1)
    const [AIType, setAIType] = useState(Object.keys(computerTypes)[0])

    useEffect(()=>{
        globalThis.cookie.style = customStyle.name
        console.log(globalThis.cookie.style)
    }, [customStyle])

    useEffect(()=>{
        globalThis.cookie.sound = soundOn
        console.log(globalThis.cookie.sound)
    }, [soundOn])

    const noticeMe = {
        'background-color': 'rgb(159 36 199)',
        'font-size': '1.2rem',
        padding: '0.5rem'
    };

    return <React.Fragment>
    <script src="../dist/foam-bin.js"></script>
    <script src="./helper-js/join.js" type="module"></script>
    <Header />
    <section>
        <div className="container-fluid text-white pt-5">
            <div className="container my-5 custom-bg-primary pb-5 rounded">
                <div className="row mb-4">
                    <div className="col-lg-7 pt-5 mt-5">
                        <div className="container">
                            <img className="logo" src="./assets/_Logo.png" alt="" />
                        </div>
                        <p className="h3">Chess 2 by <a className="text-decoration-none" href="https://www.youtube.com/c/OatsJenkins">Oats Jenkins</a></p>
                        <p className="h3">Website by Zach Alfano</p>
                        <p className="h3">Chess 2 <a href="https://discord.gg/aGFThSgGsj">Discord</a> by sup lloooll</p>
                        <p style={noticeMe}>
                            ^ Discord link was broken, but we fixed it
                        </p>
                    </div>
                    <div className="col-lg-5 pt-5">
                        <div className="container custom-bg-tertiary rounded pt-3 pb-3">
                            <div><p className="h2 text-center" id="rooms-count">Loading room count...</p></div>
                            
                            <h2>Quick Play</h2>

                            <div className="d-grid">
                                <button type="button" id="raw-singleplayer" className="btn btn-primary btn-block">Play (singleplayer)</button>
                                <p>
                                    Press this button if you just want to jump into a singleplayer game!
                                </p>
                            </div>
                            <div className="d-grid">
                                <button type="button" id="raw-join-timed" className="btn btn-primary btn-block">Play (timed 15 minutes)</button>
                                <p>
                                    Press this button if you just want to jump into a timed online game!
                                </p>
                            </div>
                            <div className="d-grid">
                                <button type="button" id="raw-join" className="btn btn-primary btn-block">Play (un-timed)</button>
                                <p>
                                    Press this button if you just want to jump into an online game!
                                </p>
                            </div>

                            <div className="d-grid">
                                {/* <foam className="chess2.GameConfigView" of="chess2.GameConfig"></foam> */}
                                <div>
                                    <h2>Custom Game</h2>
                                    <div>
                                        <div style={{display: "flex", gap: "1.5rem"}}>
                                            <div>
                                                <label>Game Mode</label>
                                                <br/>
                                                <select className="rounded" title="Game Mode" defaultValue={GameModes.SINGLE_PLAYER.modeName} onChange={(e)=>{setGameMode(e.target.value)}}>
                                                    {
                                                        Object.keys(GameModes).map((el)=>{
                                                            return GameModes[el].hidden ? "" : <option key={el} value={el}>{GameModes[el].label}</option>
                                                        })
                                                    }
                                                </select>

                                            </div>
                                            { !GameModes[gameMode].singleplayer ?
                                                <div>
                                                    <label>Room ID</label>
                                                    <input onChange={(e)=>setRoomID(e.target.value)} className="w-100 rounded border-0" type="text" />
                                                </div>
                                                : ""
                                            }
                                            { GameModes[gameMode].modeName == GameModes.HUMAN_VS_AI.modeName ? 
                                                <React.Fragment>
                                                    <div>
                                                        <label>AI Type</label>
                                                        <select className="rounded" title="Game Mode" defaultValue={GameModes.SINGLE_PLAYER.modeName} onChange={(e)=>{setAIMode(e.target.value)}}>
                                                            {
                                                                Object.keys(computerTypes).map((el)=>{
                                                                    return <option key={el} value={el}>{el}</option>
                                                                })
                                                            }
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label>AI Level</label>
                                                        {/* <input onChange={e=>setAILevel(e.target.value)} type="number" placeholder="2" min="1" max="3" className="w-100 rounded border-0" /> */}
                                                        <select className="rounded" onChange={e=>setAILevel(+e.target.value)}>
                                                            <option value="1">Easy</option>
                                                            <option value="2">Medium</option>
                                                            <option value="3">Hard</option>
                                                            <option value="4">Very Hard</option>
                                                        </select>
                                                    </div>
                                                </React.Fragment>
                                                : ""
                                            }
                                            <div>
                                                <label>Time (minutes)</label> 
                                                <br/>
                                                <input onChange={e=>setTimeLimit(e.target.value)} className="w-100 rounded border-0" type="number" />
                                            </div>
                                        </div>
                                        <button 
                                            onClick={()=>{goToGame({modeName:gameMode, roomID, timeLimit, computerLevel: AILevel, computerType: AIType})}} 
                                            className="btn btn-primary btn-block w-100 mt-4"
                                            disabled={!GameModes[gameMode].singleplayer && roomID==""}
                                            >
                                                Start
                                        </button>
                                    </div>
                                </div>
                                <p>
                                    If you want to play with friends, you can enter a custom room ID! Please use an uncommon room name so that you're 
                                    less likely to join someone else's game by accident.
                                </p>
                            </div>
                            
                            <h2 className="mt-5">Settings</h2>
                            <div>
                                <SettingsMenu 
                                    customStyle={customStyle} 
                                    setCustomStyle={setCustomStyle} 
                                    soundOn={soundOn} 
                                    setSoundToggle={setSoundToggle}
                                />
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</React.Fragment>
}

function Root(props) { return <HomePage></HomePage> }

ReactDOM.render( Root(), document.getElementById('react-main-root') );