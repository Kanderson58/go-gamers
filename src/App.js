import { useEffect, useState } from 'react';
import './App.css';
import { initializeApp } from 'firebase/app';
import { getFirestore, getDoc, doc, updateDoc } from 'firebase/firestore';
import { Slider } from '@mui/material';

const firebaseConfig = {
  apiKey: "AIzaSyD_bUvgzrtGDKakaXi0AswV1v-o3T2lnHg",
  authDomain: "go-gamers-f5d9b.firebaseapp.com",
  projectId: "go-gamers-f5d9b",
  storageBucket: "go-gamers-f5d9b.appspot.com",
  messagingSenderId: "628130654826",
  appId: "1:628130654826:web:11a5fa3293e0d1d985f813"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let trail = [];
const logoMap = {
  golinks: './logo.png',
  gosearch: './search.png',
  goprofiles: './profile.png'
}

const getRandomWindowPos = (min, max) => {
  return Math.floor(Math.random() * ((max - 100) - (min) + min));
}

let difficulty = 50;
if (localStorage.getItem('difficulty')) difficulty = localStorage.getItem('difficulty');

const getTrafficCones = () => {
  const cones = [];
  const coneLocations = [];
  for(var i = 0; i < difficulty; i++) {
    let randomPos = {top: getRandomWindowPos(0, window.innerHeight), left: getRandomWindowPos(0, window.innerWidth)};
    if (randomPos.top < 100 && randomPos.left < 100) randomPos= {top: randomPos.top + 100, left: randomPos.left + 100};
    if (randomPos.top > window.innerHeight - 100 && randomPos.left > window.innerWidth - 100) randomPos= {top: randomPos.top - 100, left: randomPos.left - 100};
    cones.push(<img src={require('./traffic.png')} alt="traffic cone" className='traffic' style={{top: randomPos.top, left: randomPos.left}} key={`${randomPos.top}${randomPos.left}`} />)
    coneLocations.push(randomPos);
  }

  return {cones: cones, coneLocations: coneLocations};
}

let cones;

const getScores = async () => {
  const response = doc(db, 'wins', 'HYqMpv64MGHf36oWwGR1');
  const collectionSnapshot = await getDoc(response);
  const scores = collectionSnapshot.data();
  return scores;
}

function App() {
  const [pos, setPos] = useState({ });
  const [logo, setLogo] = useState('');
  // const [hit, setHit] = useState(false);
  const [gameStart, setGameStart] = useState(false);
  const [result, setResult] = useState('');
  const [scores, setScores] = useState();
  
  useEffect(() => {
    setTimeout(() => {
      trail = (trail.length > 0) ? trail.slice(1) : trail;
    }, 500);
  }, [pos]);

  useEffect(() => {
    if(!scores) return;
    const updateScores = async () => {
      const scoreRef = doc(db, "wins", "HYqMpv64MGHf36oWwGR1");
      await updateDoc(scoreRef, {
        [logo]: scores[logo]
      });
    }

    updateScores();
  }, [scores]);

  useEffect(() => {
    if(localStorage.getItem('team')) setLogo(localStorage.getItem('team'));
  }, []);

  const scoreGetter = async () => {
    const updatedScores = await getScores();
    return updatedScores;
  }
  
  const checkIfClose = (e) => {
    if((e.clientX - pos.X) > 10 || (e.clientX - pos.X) > -10) return true;
    if((e.clientY - pos.Y) > 10 || (e.clientY - pos.Y) > -10) return true;
  }

  const checkForCones = (e) => {
    const checkedCones = cones.coneLocations.map(cone => {
      const posDiff = {x: cone.left - e.clientX, y: cone.top - e.clientY};
      if(posDiff.x > -50 && posDiff.x < -20 && posDiff.y > -90 && posDiff.y < 10) return cone;
    });
    if(checkedCones.find(check => check)) {
      // setHit(true);
      setResult('You hit a cone!  You lose 🚗🚧');
    };
  }

  const moveTrail = (e) => {
    if (checkIfClose(e)) return;
    setPos({ x: e.clientX - 10, y: e.clientY + 10 })
    if (!pos.x || !pos.y) return;
    if(trail.find(img => img.key === `${pos.y}${pos.x}`)) return;
    trail.push(<img src={require(`${logoMap[logo]}`)} alt="logo" className='logo' style={{position: 'absolute', top: pos.y, left: pos.x}} key={`${pos.y}${pos.x}`} />)
    if(!gameStart) return;
    checkForCones(e);
  };

  const changeLogo = (e) => {
    setLogo(e.target.value);
    trail = [];
    localStorage.setItem('team', e.target.value);
  }

  const startGame = async () => {
    setResult('');
    const newScores = await scoreGetter();
    setScores(newScores);
    setGameStart(true);
    cones = getTrafficCones();
    trail = [];
  }

  const winGame = async () => {
    setScores({...scores, [logo]: scores[logo] + 1});
    setGameStart(false);
    setResult('You win! 🏆');
  }
  
  const restartGame = async () => {
    // setHit(false);
    setGameStart(false);
    
    const storedDifficulty = localStorage.getItem('difficulty', difficulty);
    if(storedDifficulty) difficulty = storedDifficulty;

    const storedTeam = localStorage.getItem('team', logo);
    if(storedTeam) setLogo(storedTeam);

    setResult('');
    trail = [];
    cones = [];    
  }

  const sortScores = () => {
    if(!scores) return;
    const sortedScores = Object.keys(scores).sort((a, b) => scores[b] - scores[a]).map(key => {
      const formattedKey = key.charAt(0).toUpperCase() + key.slice(1, 2) + key.charAt(2).toUpperCase() + key.slice(3);
      return <li>{formattedKey}: {scores[key]}</li>
    })
    return sortedScores;
  }

  const handleChange = (e) => {
    difficulty = e.target.value;
    localStorage.setItem('difficulty', difficulty);
  }

  const handleMouseOut = () => {
    if (!gameStart) return;
    setGameStart(false);
    setResult('You left the game!  You lose 🚗🚧');
  }
  
  return (
    <div className='app-container' onMouseLeave={handleMouseOut}>
      {(!gameStart && !result) && <button style={{top: 25, left: 25}} onClick={startGame}>Start</button>}
      <div className="app" onMouseMove={moveTrail} onTouchStart={moveTrail}>
        {trail.map(img => img)}
          {!result && <>
            {gameStart && cones.cones}
            {!gameStart &&
              <>
                <p>Select Team:</p>
                <select name='logo' id='logo' onChange={changeLogo}>
                  <option value='golinks' selected={logo === 'golinks' ? 'selected' : ''}>GoLinks</option>
                  <option value='gosearch' selected={logo === 'gosearch' ? 'selected' : ''}>GoSearch</option>
                  <option value='goprofiles'  selected={logo === 'goprofiles' ? 'selected' : ''}>GoProfiles</option>
                </select>
              </>}
          </>}
          {!gameStart && !result && <div className='slider-container'>
            <p className='slider-header'>Select Difficulty:</p>
            <Slider
              size="small"
              defaultValue={difficulty}
              aria-label="Small"
              valueLabelDisplay="auto"
              onChange={handleChange}
              className='slider'
              step={10} 
              marks 
              min={50} 
              max={150}
              sx={{
                width:'16.5em'
              }}
            />
          </div>}
          {result && <div className='result-container'>
            <p className='result'>{result}</p>
            <ul>
              {sortScores()}
            </ul>
            <button onClick={restartGame} className='reset'>Reset</button>
          </div>}
      </div>
      {(!result && gameStart) && <button style={{top: window.innerHeight - 100, left: window.innerWidth - 175}} onClick={winGame}>Finish</button>}
    </div>
  );
}

export default App;
