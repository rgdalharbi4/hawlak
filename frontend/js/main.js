if($('#demoBtns')) $('#demoBtns').innerHTML=[['eg','المسار الأساسي: مستخدم من مصر'],['id','مستخدم من إندونيسيا'],['tr','مستخدمة من تركيا']].map(d=>`<button class="btn" data-act="demo" data-v="${d[0]}">${d[1]}</button>`).join('')+`<button class="btn ghost" data-act="restart">من البداية (اختيار الدولة)</button>`;
render();
