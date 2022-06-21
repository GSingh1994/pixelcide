import "../../styles/Game/Status.scss";
import Button from "../Button";
import { Link } from "react-router-dom";

import { FaRegFlag } from "react-icons/fa";

const Status = (props) => {
  const { status, handleCommands, validate, currentPlayer } = props;

  return (
    <div className="">
      {status === "player_turn" && (
        <div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ ease: "easeOut", duration: 0 }} className="player-turn center">
          {`-- ${currentPlayer.username}'s TURN --`}
        </div>
      )}

      {status === "player_attack" && (
        <div initial={{ opacity: 0, y: 0 }} animate={{ opacity: 1, y: -10 }} exit={{ opacity: 0, y: -60 }} transition={{ ease: "easeInOut", duration: 0.1 }}>
          <div className="attack-div center">
            <Button onClick={() => handleCommands("Attack")} error disabled={!validate.attackButton}>
              ATTACK
            </Button>
            <Button onClick={() => handleCommands("Yield")}>
              <FaRegFlag size={25} />
            </Button>
          </div>
        </div>
      )}

      {status === "boss_attack" && (
        <div
          layout
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: -10 }}
          exit={{ opacity: 0, y: -60 }}
          transition={{ ease: "easeInOut", duration: 0.2 }}
          className="center"
        >
          <Button onClick={() => handleCommands("Discard")} error disabled={!validate.discardButton}>
            DISCARD
            <span className="count"> {validate.discardValue > 0 ? validate.discardValue : ""}</span>
          </Button>
        </div>
      )}

      {status === "game_over_win" && (
        <div className="center">
          <div className="game-over">YOU WON</div>
          <Link to="/">
            <Button error>BACK TO MENU</Button>
          </Link>
        </div>
      )}

      {status === "game_over_lose" && (
        <div className="center">
          <div className="game-over center">YOU LOSE</div>
          <Link to="/">
            <Button error>BACK TO MENU</Button>
          </Link>
        </div>
      )}
    </div>
  );
};
export default Status;
