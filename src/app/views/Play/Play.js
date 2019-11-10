import React, {useState, useEffect} from "react";
import Form from "react-bootstrap/Form";
import './Play.css';

import axios from "axios";
import Button from "react-bootstrap/Button";

function PlayGame(props) {
    function audioQ(e) {
        document.getElementById("Q").play();
    }
    function audioW(e) {
        document.getElementById("W").play();
    }
    function audioE(e) {
        document.getElementById("E").play();
    }
      function audioR(e) {
        document.getElementById("R").play();
    }

    const gameId = props.match.params.gameId;
    const [initialGet, setInitialGet] = useState(false);
    const [timeLimit, setTimeLimit] = useState(60);
    const [curQuestion, setCurQuestion] = useState({
        "_id": {
            "$oid": " "
        },
        'question': ' ',
        'A': ' ',
        'B': ' ',
        'C': ' ',
        'D': ' ',
        'answer': ' '
    });
    const [displayQuestion, setDisplayQuestion] = useState(true);
    const [playersArr, setPlayersArr] = useState([]);

    // Answer Validation
    const [answer, setAnswer] = useState("e")
    const [iscorrect, setIsCorrect] = useState(false);

    function validateAnswer(champion) {
      setAnswer(champion)
    }


    function renderQuestion() {
        setInitialGet(true);
        axios.get('/game/' + gameId).then(res => {
            setTimeLimit(res.data["time_limit"]);
            setCurQuestion(res.data["questions"][res.data["cur_question"]]);
        }).catch(err => {

            console.log("Failed to GET /game");
        });
    }

    function renderScores() {
        axios.get('/player/game/' + gameId).then(res => {
            setTimeLimit(10);
            console.log(res.data)
            setPlayersArr(res.data);

        }).catch(err => {
            console.log("failed to GET /game");
        });
    }

    useEffect(() => {
        if (!initialGet) {
            setInitialGet(true);
            renderQuestion();
        }
        if (!timeLimit || timeLimit < 1) {
            if (displayQuestion) {
                renderScores();
            } else {
                axios.put('/game/' + gameId).then(res => {
                    if (res.data["game_state"] !== "done") {
                        renderQuestion();
                    } else {
                        props.history.push('/admin/end-game/' + gameId);
                    }
                }).catch(err => {
                    console.log("Failed to update gamestate");
                });
            }
            setDisplayQuestion(!displayQuestion);
        }
        const intervalId = setInterval(() => {
            setTimeLimit(timeLimit + 1);
        }, 1000);

        return () => clearInterval(intervalId);
    }, [timeLimit]);


    return (
        <div className="Question">
            <div className="question-stopwatch">
                <div>
                    {/*<audio id={'Q'}>*/}
                    {/*    <source*/}
                    {/*        src={"Given_URL_Q"}*/}
                    {/*        type={"audio/wav"}>*/}
                    {/*    </source>*/}
                    {/*</audio>*/}

                    {/*<audio id={'W'}>*/}
                    {/*    <source*/}
                    {/*        src={"Given_URL_W"}*/}
                    {/*        type={"audio/wav"}>*/}
                    {/*    </source>*/}
                    {/*</audio>*/}

                    {/*<audio id={'E'}>*/}
                    {/*    <source*/}
                    {/*        src={"Given_URL_E"}*/}
                    {/*        type={"audio/wav"}>*/}
                    {/*    </source>*/}
                    {/*</audio>*/}

                    {/*<audio id={'R'}>*/}
                    {/*    <source*/}
                    {/*        src={"Given_URL_R"}*/}
                    {/*        type={"audio/wav"}>*/}
                    {/*    </source>*/}
                    {/*</audio>*/}

                    <div className="stopwatch">{timeLimit}</div>
                    <div className="game-title">
                        <h1>Who's That Champion?</h1>
                    </div>

                    {displayQuestion ?
                        <div>
                            <p className="question">{curQuestion.question}</p>
                            <div className="choices">
                                <Button onClick={audioQ}>Q {curQuestion.q}</Button>
                                <Button onClick={audioW}>W {curQuestion.e}</Button>
                                <Button onClick={audioE}>E {curQuestion.w}</Button>
                                <Button onClick={audioR}>R {curQuestion.r}</Button>
                            </div>
                          <div className="Answer">
                            <Form>
                              <Form.Group controlId="name">
                                  <Form.Control champion="Enter Champion Name"></Form.Control>
                                  <Button onClick={validateAnswer}>Lock In</Button>
                              </Form.Group>
                            </Form>
                          </div>
                        </div>
                        :
                        <div>
                            <p className="question">Scores</p>
                            <div>
                                {playersArr.map((p, i) => (
                                    <div index={i} key={i}>
                                        <p>{p.name}: {p.points}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    }

                </div>
            </div>
        </div>
    );
}

export default PlayGame;
