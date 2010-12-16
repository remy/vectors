function Tree(x, y, options) {
  var tree = this;
  
  if (options == undefined) {
    options = {};
  }
  
  // controls
  this.x = x;
  this.y = y;
  this.base = options.base || 20;
  this.growAmount = options.growAmount || 0.01;
  this.incAmount = options.incAmount || 0.25;
  this.growSpeed = options.growSpeed || 10;
  this.growDelay = options.growDelay || 1000;
  
  
  this.length = 0;
  this.drawLength = 0;
  
  this.vectors = [];
};

Tree.prototype = {
  add: function (x, y, nobranch) {
    var v = new Vector(x, y),
        tree = this,
        aggLength = 0;

    this.vectors.push(v);
    this.length += v.magnatude;
    this.inc = 1 / this.length;

    this.vectors.forEach(function (v, i) {
      v.id = i + 1;
      v.segLength = v.magnatude * tree.inc;
      v.base = tree.base * (1 - aggLength); // starts at zero
      aggLength += v.segLength;
      v.top = tree.base * (1 - aggLength); // starts at zero
      v.aggLength = aggLength;
    });
    
    if (false && !nobranch) {
      // automatically add branches
      
      // decide whether we should add a branch to this vector
      if (true || Math.random() < 0.5) { // 1 in 10 chance
        var branchV = v.clone().mult(Math.random().toFixed(2));
        var branch = new Tree(branchV.x, branchV.y, { base: 10 });
        branch.add(-45, -45, true);
        
        v.branch = branch;
        
        // if (Math.random() < 0.1) {
        //   branch.add(v.x * 1 * Math.random(), -(Math.random() * 50 + 20), true);
        // }
      }
    }
  },
  grow: function (incLength) {
    var i = this.drawLength,
        tree = this;
    this.drawLength += incLength;
    var timer = setInterval(function () {
      
      i += tree.growAmount;
      tree.draw(i);
      if (i >= tree.drawLength || i >= 1) {
        clearInterval(timer);
        if (i < 1) {
          setTimeout(function () {
            tree.grow(tree.incAmount);
          }, tree.growDelay);
        }
      }
    }, tree.growSpeed);
  },
  draw: function (length) {
    var cx = this.x,
        cy = this.y,
        t = this.vectors[0], // used for partial line
        completed = 0,
        i = 0,
        baseWidth;
        
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.beginPath();
    ctx.moveTo(this.x - (this.base * length / 2), this.y);
    util.drawing = false;
    // forward
    for (; i < this.vectors.length; i++) {
      v = this.vectors[i];
      // if this line needs to be completely drawn
      if (v.aggLength <= length) {
        cx += v.x;
        cy += v.y;
        
        baseWidth = this.base * (length - v.aggLength) / 2;
        
        // spine
        util.line(cx - v.x, cy - v.y, cx, cy);
        
        if (i < this.vectors.length - 1) { // i.e. there's more
          t = v.clone();
          
          // add the next vector, but allow for the next not being at 100% length
          var v2 = this.vectors[i+1].clone();
          // v2.mult((length - (completed + v.segLength)) / this.vectors[i+1].segLength);
          t.add(v2);
          t.rotate(90);
          t.normalise();
          t.mult(baseWidth);
          ctx.lineTo(cx - t.x, cy - t.y);
          // rotated vector
          util.line(cx, cy, cx - t.x, cy - t.y);
          util.dot(cx - t.x, cy - t.y, 3);
          // circle
          util.circle(cx, cy, 10);
        } else {
          // circle
          util.circle(cx - baseWidth, cy, 10);
          ctx.lineTo(cx - baseWidth, cy);
        }
        
        completed += v.segLength;
        // if (v.branch) {
        //   setTimeout((function (cx, cy, v) {
        //     return function () {
        //       var branchV = v.clone().mult(Math.random().toFixed(2));
        //       var branch = new Tree(cx - branchV.x, cy - branchV.y, { base: v.top });
        //       branch.add(145, -145, true);
        //       
        //       branch.draw(1);
        //       
        //     }
        //   })(cx, cy, v), 1);
        // }
      // else if there's a partial line to be drawn
      } else if (completed - length != 0) {
        t = v.clone();
        t.mult((length - completed) / v.segLength);
        cx += t.x;
        cy += t.y;
        
        util.line(cx - t.x, cy - t.y, cx, cy);
        
        // this is the point at the end of the tree
        ctx.lineTo(cx, cy);
        util.circle(cx, cy);

        // go back to the root point
        cx -= t.x;
        cy -= t.y;
        
        // now move out to the correct thickness
        
        // go a partial amount back down
        if (i > 0) t.add(this.vectors[i-1]); // add the next vector
        t.rotate(-90);
        t.normalise();
        t.mult(baseWidth);
        ctx.lineTo(cx - t.x, cy - t.y);
        util.line(cx - t.x, cy - t.y, cx + t.x, cy + t.y);
        util.dot(cx + t.x, cy + t.y, 3);
        
        break; // fin
      } else {
        break;
      }
    }
        
    // back
    i--;
    for (; i > 0; i--) {
      v = this.vectors[i];
      cx -= v.x;
      cy -= v.y;
      
      baseWidth = this.base * (length - this.vectors[i-1].aggLength) / 2;
      
      if (i > 0) { // i.e. there's more
        t = v.clone();
        t.add(this.vectors[i-1]); // add the next vector
        t.rotate(90);
        t.normalise();
        t.mult(baseWidth);
        ctx.lineTo(cx + t.x, cy + t.y);
        util.dot(cx + t.x, cy + t.y, 3);
        util.line(cx, cy, cx + t.x, cy + t.y);
      } else {
        ctx.lineTo(cx + baseWidth, cy);
      }
    }
    
    ctx.lineTo(this.x + (this.base * length / 2), this.y);
    // console.log('close');
    ctx.stroke();
    ctx.closePath();
    ctx.fill();
  }
};
