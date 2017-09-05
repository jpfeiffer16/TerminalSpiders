const fs = require( 'fs' ) ;
const path = require('path');
const termkit = require( 'terminal-kit' ) ;

let term ;
let ScreenBuffer = termkit.ScreenBuffer ;

let background;
let spiders = [];
let spiderBuffers = [];
let viewport;

function setupBackground() {
  //Setup Background
  background = ScreenBuffer.create( {
    width: viewport.width ,
    height: viewport.height ,
    noFill: true
  });
  
  background.fill( { attr: { color: 'white' , bgColor: 'black' } } ) ;
}

function setupSpiders() {
  //Setup Spider Buffers
  let files = fs.readdirSync('./spiders');
  // files.forEach(file => 
  //   spiderBuffers.push(
  //     ScreenBuffer.createFromString(
  //       {},
  //       fs.readFileSync(
  //         path.join('./spiders', file),
  //         'utf-8'
  //       )
  //     )
  //   )
  // );
  files.forEach(file => 
    spiderBuffers.push(
      fs.readFileSync(
        path.join('./spiders', file),
        'utf-8'
      )
    )
  );
  //Setup Spiders
  for (let i = 0; i < 10; i++) {
    // let min = 0;
    // let max = process.settings.responseCodes.length - 1;
    // let randomIndex =  Math.floor(Math.random() * (max - min + 1) + min);
    // Math.floor(Math.random() * (max - min + 1) + min);
    let thisSpider = {
      speed: Math.floor(Math.random() * (3 - 1 + 1) + 1),
      buff: ScreenBuffer.createFromString(
        {},
        spiderBuffers[Math.floor(Math.random() * (spiderBuffers.length - 1 - 0 + 1) + 0)],
      ),
      x: 0,
      y: 0
    };
    Object.defineProperty(thisSpider, 'x', {
      get() {
        return thisSpider.buff.x;
      },
      set(value) {
        thisSpider.buff.x = value;
      }
    });
    Object.defineProperty(thisSpider, 'y', {
      get() {
        return thisSpider.buff.y;
      },
      set(value) {
        thisSpider.buff.y = value;
      }
    });
    thisSpider.x =  Math.floor(Math.random() * (viewport.width - 0 + 1) + 0);

    spiders.push(thisSpider);
  }

}



function draw()
{
  // console.log('Drawing');

	background.draw({ dst: viewport , tile: true });
  spiders.forEach(spider => spider.buff.draw({ dst: viewport , tile: false }));
	var stats = viewport.draw() ;
  
  

	// term.moveTo.eraseLine.bgWhite.green( 1 , 1 ,
	// 	'Arrow keys: move the ship - Q/Ctrl-C: Quit - Redraw stats: %d cells, %d moves, %d attrs, %d writes\n' ,
	// 	stats.cells , stats.moves , stats.attrs , stats.writes
	// ) ;
	
	// frames ++ ;
}

function init( callback )
{
  termkit.getDetectedTerminal( function( error , detectedTerm ) {
      
    if (error) { throw new Error('Cannot detect terminal.'); }
    
    term = detectedTerm;
    
    viewport = ScreenBuffer.create({
      dst: term ,
      width: Math.min(term.width),
      height: Math.min(term.height),
      y: 1
    });
    
    
    //term.fullscreen() ;
    //term.moveTo.eraseLine.bgWhite.green( 1 , 1 , 'Arrow keys: move the ship - Q/Ctrl-C: Quit\n' ) ;
    term.hideCursor() ;
    term.grabInput() ;
    term.on( 'key' , inputs ) ;
    callback() ;
  } ) ;
}

function update() {
  spiders.forEach(spider => {
    spider.y += spider.speed / 30;
  });
}

function terminate()
{
	//term.fullscreen( false ) ;
	term.hideCursor( false ) ;
	term.grabInput( false ) ;
	
	setTimeout( function() {
		term.moveTo( 1 , term.height , '\n\n' ) ;
		process.exit() ;
	} , 100 ) ;
}

function inputs(key)
{
  //console.log(key);
  switch (key)
  {
    case 'q':
    case 'CTRL_C':
      terminate() ;
      break ;
  }
}

function animate() {
  draw();
  update();
  setTimeout(animate, 50);
}

init(() => {
  // console.log('init done!');
  setupBackground();
  setupSpiders();
  animate();

  //TEMP
  spiders.forEach((spider, index) => {
    spider.x = index
  });
  fs.writeFileSync('./test.txt',
    // JSON.stringify(spiders)
    spiders
      .map(spider => spider.x)
      .join('\n')
  );
});