import { useEffect, useState } from 'react';
import './App.css';

let trail = [];
const logoMap = {
  golinks: './logo.png',
  gosearch: './search.png',
  goprofiles: './profile.png'
}

const getRandomWindowPos = (min, max) => {
  return Math.floor(Math.random() * ((max - 100) - (min + 100)));
}

const getTrafficCones = () => {
  const cones = [];
  const coneLocations = [];
  for(var i = 0; i < (Math.ceil(Math.random() * (45 - 20) + 20)); i++) {
    const randomPos = {top: getRandomWindowPos(0, window.innerHeight), left: getRandomWindowPos(0, window.innerWidth)};
    cones.push(<img src={require('./traffic.png')} alt="traffic cone" className='traffic' style={{top: randomPos.top, left: randomPos.left}} />)
    coneLocations.push(randomPos);
  }
  return {cones: cones, coneLocations: coneLocations};
}

let cones;

function App() {
  const [pos, setPos] = useState({ });
  const [logo, setLogo] = useState('golinks');
  const [hit, setHit] = useState(false);
  const [gameStart, setGameStart] = useState(false);
  const [result, setResult] = useState('');

  useEffect(() => {
    setTimeout(() => {
      trail = (trail.length > 0) ? trail.slice(1) : trail;
    }, 500);
  }, [pos]);

  const checkIfClose = (e) => {
    if((e.clientX - pos.X) > 10 || (e.clientX - pos.X) > -10) return true;
    if((e.clientY - pos.Y) > 10 || (e.clientY - pos.Y) > -10) return true;
  }

  const checkForCones = (e) => {
    const checkedCones = cones.coneLocations.map(cone => {
      const posDiff = {x: cone.left - e.clientX, y: cone.top - e.clientY};
      if(posDiff.x > -50 && posDiff.x < 30 && posDiff.y > -80 && posDiff.y < 30) return cone;
    });
    if(checkedCones.find(check => check)) {
      setHit(true);
      setResult('You hit a cone!  You lose 🚗🚧');
    };
  }

  const moveTrail = (e) => {
    if (checkIfClose(e)) return;
    setPos({ x: e.clientX - 10, y: e.clientY + 10 })
    if (!pos.x || !pos.y) return;
    if(pos.x === e.clientX && pos.y === e.clientY) return;
    trail.push(<img src={require(`${logoMap[logo]}`)} alt="logo" className='logo' style={{position: 'absolute', top: pos.y, left: pos.x}} />)
    if(!gameStart) return;
    checkForCones(e);
  };

  const changeLogo = (e) => {
    setLogo(e.target.value);
    trail = [];
  }

  const startGame = () => {
    setGameStart(true);
    cones = getTrafficCones();
    trail = [];
  }

  const winGame = () => {
    setGameStart(false);
    setResult('You win! 🏆');
  }

  const restartGame = () => {
    setHit(false);
    setGameStart(false);
    setLogo('golinks');
    setResult('');
    trail = [];
    cones = [];
  }

  return (
    <div className='app-container'>
      {!result && <button style={{top: 25, left: 25}} onClick={startGame}>Start</button>}
      <div className="app" onMouseMove={moveTrail}>
        {trail.map(img => img)}
          {!result && <>
            {gameStart && cones.cones}
            <select name='logo' id='logo' onChange={changeLogo}>
              <option value='golinks'>GoLinks</option>
              <option value='gosearch'>GoSearch</option>
              <option value='goprofiles'>GoProfiles</option>
            </select>
          </>}
          {result && <div className='result-container'>
            <p className='result'>{result}</p>
            <button onClick={restartGame} className='reset'>Reset</button>
          </div>}
      </div>
      {(!result && gameStart) && <button style={{top: window.innerHeight - 100, left: window.innerWidth - 175}} onClick={winGame}>Finish</button>}
    </div>
  );
}

export default App;
