import Quill from './core';

import { AlignClass, AlignStyle } from './formats/align';
import {
  DirectionAttribute,
  DirectionClass,
  DirectionStyle,
} from './formats/direction';
import Indent from './formats/indent';

import Blockquote from './formats/blockquote';
import Header from './formats/header';
import List from './formats/list';

import { BackgroundClass, BackgroundStyle } from './formats/background';
import { ColorClass, ColorStyle } from './formats/color';
import { FontClass, FontStyle } from './formats/font';
import { SizeClass, SizeStyle } from './formats/size';

import Bold from './formats/bold';
import Italic from './formats/italic';
import Link from './formats/link';
import Script from './formats/script';
import Strike from './formats/strike';
import Underline from './formats/underline';

import Formula from './formats/formula';
import Image from './formats/image';
import Video from './formats/video';

import CodeBlock, { Code as InlineCode } from './formats/code';

import Syntax from './modules/syntax';
import Table from './modules/table';
import Toolbar from './modules/toolbar';

import Icons from './ui/icons';
import Picker from './ui/picker';
import ColorPicker from './ui/color-picker';
import IconPicker from './ui/icon-picker';
import Tooltip from './ui/tooltip';

import BubbleTheme from './themes/bubble';
import SnowTheme from './themes/snow';

import normalizeUrl from 'normalize-url';
import Delta from 'quill-delta';

import Keys from './modules/quill-mention/constants/keys';
import './modules/quill-mention/blots/mention';

const numberIsNaN = function (x) {
  return x !== x;
};

Quill.register(
  {
    'attributors/attribute/direction': DirectionAttribute,

    'attributors/class/align': AlignClass,
    'attributors/class/background': BackgroundClass,
    'attributors/class/color': ColorClass,
    'attributors/class/direction': DirectionClass,
    'attributors/class/font': FontClass,
    'attributors/class/size': SizeClass,

    'attributors/style/align': AlignStyle,
    'attributors/style/background': BackgroundStyle,
    'attributors/style/color': ColorStyle,
    'attributors/style/direction': DirectionStyle,
    'attributors/style/font': FontStyle,
    'attributors/style/size': SizeStyle,
  },
  true,
);

Quill.register(
  {
    'formats/align': AlignClass,
    'formats/direction': DirectionClass,
    'formats/indent': Indent,

    'formats/background': BackgroundStyle,
    'formats/color': ColorStyle,
    'formats/font': FontClass,
    'formats/size': SizeClass,

    'formats/blockquote': Blockquote,
    'formats/code-block': CodeBlock,
    'formats/header': Header,
    'formats/list': List,

    'formats/bold': Bold,
    'formats/code': InlineCode,
    'formats/italic': Italic,
    'formats/link': Link,
    'formats/script': Script,
    'formats/strike': Strike,
    'formats/underline': Underline,

    'formats/formula': Formula,
    'formats/image': Image,
    'formats/video': Video,

    'modules/syntax': Syntax,
    'modules/table': Table,
    'modules/toolbar': Toolbar,

    'themes/bubble': BubbleTheme,
    'themes/snow': SnowTheme,

    'ui/icons': Icons,
    'ui/picker': Picker,
    'ui/icon-picker': IconPicker,
    'ui/color-picker': ColorPicker,
    'ui/tooltip': Tooltip,
  },
  true,
);

let History = Quill.import('modules/history');

class HistoryExtension extends History {
  constructor(quill, options) {
    super(quill, options);
  }
  redoSilent() {
    this.changeSilent('redo', 'undo');
  }
  undoSilent() {
    this.changeSilent('undo', 'redo');
  }
  changeSilent(source, dest) {
    if (this.stack[source].length === 0) return;
    const delta = this.stack[source].pop();
    const base = this.quill.getContents();
    const inverseDelta = delta.invert(base);
    this.stack[dest].push(inverseDelta);
    this.lastRecorded = 0;
    this.ignoreChange = true;
    this.quill.updateContents(delta, Quill.sources.SILENT);
    this.ignoreChange = false;
    const index = getLastChangeIndex(this.quill.scroll, delta);
    this.quill.setSelection(index);
  }
}

Quill.register('modules/history', HistoryExtension, true);

var BlockEmbed = Quill.import('formats/image');
var MediaEmbed = Quill.import('blots/block/embed');
const ImageFormatAttributesList = [
    'alt',
    'height',
    'width',
    'style'
];

const AVMediaAttributesList = [
    'alt',
    'height',
    'width',
    'style',
    'mimeType',
    'controls',
    'data-setup',
    'type'
];

class VideoEmbedBlot extends MediaEmbed {
  static create(value) {
    let node = super.create();
    if (value.url) {
      node.setAttribute('src', value.url);
    } else if (typeof value === 'string') {
      node.setAttribute('src', value);
    }
    node.setAttribute('controls', 'controls');
    node.setAttribute('data-setup', '{}');
    return node;
  }
  static formats(domNode) {
    return AVMediaAttributesList.reduce(function(formats, attribute) {
      if (domNode.hasAttribute(attribute)) {
        formats[attribute] = domNode.getAttribute(attribute);
      }
      return formats;
    }, {});
  }
  format(name, value) {
    if (AVMediaAttributesList.indexOf(name) > -1) {
      if (value) {
        this.domNode.setAttribute(name, value);
      } else {
        this.domNode.removeAttribute(name);
      }
    } else {
      super.format(name, value);
    }
  }
  static value(node) {
    var url = 'false';
    if (node) {
      url = node.getAttribute('src');
    }
    return url;
  }
}

VideoEmbedBlot.blotName = 'videoEmbed';
VideoEmbedBlot.className = 'ql-embed-video';
VideoEmbedBlot.tagName = 'VIDEO';

Quill.register({'formats/videoEmbed': VideoEmbedBlot}, true);

class AudioEmbedBlot extends MediaEmbed {
  static create(value) {
    let node = super.create();
    if (value.url) {
      node.setAttribute('src', value.url);
    } else if (typeof value === 'string') {
      node.setAttribute('src', value);
    }
    node.setAttribute('controls', 'controls');
    node.setAttribute('data-setup', '{}');
    return node;
  }
  static formats(domNode) {
    return AVMediaAttributesList.reduce(function(formats, attribute) {
      if (domNode.hasAttribute(attribute)) {
        formats[attribute] = domNode.getAttribute(attribute);
      }
      return formats;
    }, {});
  }
  format(name, value) {
    if (AVMediaAttributesList.indexOf(name) > -1) {
      if (value) {
        this.domNode.setAttribute(name, value);
      } else {
        this.domNode.removeAttribute(name);
      }
    } else {
      super.format(name, value);
    }
  }
  static value(node) {
    var url = 'false';
    if (node) {
      url = node.getAttribute('src');
    }
    return url;
  }
}

AudioEmbedBlot.blotName = 'audioEmbed';
AudioEmbedBlot.tagName = 'AUDIO';
AudioEmbedBlot.className = 'ql-embed-audio';

Quill.register({'formats/audioEmbed': AudioEmbedBlot}, true);

class ImageBlot extends BlockEmbed {
  static create(value) {
    let node = super.create();
    if (value.url) {
      node.setAttribute('src', FormatImageHandlerUrl(value.url));
    } else if (typeof value === 'string') {
      node.setAttribute('src', FormatImageHandlerUrl(value));
    }
    return node;
  }
  static formats(domNode) {
    return ImageFormatAttributesList.reduce(function(formats, attribute) {
      if (domNode.hasAttribute(attribute)) {
        formats[attribute] = domNode.getAttribute(attribute);
      }
      return formats;
    }, {});
  }
  format(name, value) {
    if (ImageFormatAttributesList.indexOf(name) > -1) {
      if (value) {
        this.domNode.setAttribute(name, value);
      } else {
        this.domNode.removeAttribute(name);
      }
    } else {
      super.format(name, value);
    }
  }
  static value(node) {
    var url = 'false';
    if (node) {
      url = node.getAttribute('src');
    }
    return url;
  }
}

ImageBlot.blotName = 'image';
ImageBlot.tagName = 'img';

Quill.register(ImageBlot, true);

// Currently grammarly is disabled in Quill by default.
// Code below is incase grammarly gets accidently enabled again
let Inline = Quill.import('blots/inline');
class GrammarlyInline extends Inline {}
GrammarlyInline.tagName = 'G';
GrammarlyInline.blotName = 'grammarly-inline';
GrammarlyInline.className = 'gr_';
Quill.register(GrammarlyInline);

const defaults = {
  globalRegularExpression: /(https?:\/\/|www\.)[\S]+/g,
  urlRegularExpression: /(https?:\/\/[\S]+)|(www.[\S]+)/,
  normalizeRegularExpression: /(https?:\/\/[\S]+)|(www.[\S]+)/,
  normalizeUrlOptions: {
    stripHash: false,
    stripWWW: false
  }
}

class MagicUrl {
  constructor (quill, options) {
    this.quill = quill
    options = options || {}
    this.options = {...defaults, ...options}
    this.registerTypeListener()
    this.registerPasteListener()
  }
  registerPasteListener () {
    this.quill.clipboard.addMatcher(Node.TEXT_NODE, (node, delta) => {
      if (typeof node.data !== 'string') {
        return
      }
      const matches = node.data.match(this.options.globalRegularExpression)
      var internalUrls = [];
      if (matches && matches.length > 0) {
        const newDelta = new Delta()
        let str = node.data
        matches.forEach(match => {
          var isInternal = IsInternalNoteUrl(match)
          if (isInternal) {
            internalUrls.push(match);
          }
          const split = str.split(match)
          const beforeLink = split.shift()
          newDelta.insert(beforeLink)
          newDelta.insert(match, {link: match})
          str = split.join(match)
        })
        newDelta.insert(str)
        delta.ops = newDelta.ops
      }

      if (internalUrls.length > 0) {
        ReplaceInternalLinkWithNoteTitle(internalUrls);
      }
      return delta
    })
  }
  registerTypeListener () {
    this.quill.on('text-change', (delta) => {
      let ops = delta.ops
      // Only return true, if last operation includes whitespace inserts
      // Equivalent to listening for enter, tab or space
      if (!ops || ops.length < 1 || ops.length > 2) {
        return
      }
      let lastOp = ops[ops.length - 1]
      if (!lastOp.insert || typeof lastOp.insert !== 'string' || !lastOp.insert.match(/\s/)) {
        return
      }
      this.checkTextForUrl()
    })
  }
  checkTextForUrl () {
    let sel = this.quill.getSelection()
    if (!sel) {
      return
    }
    let [leaf] = this.quill.getLeaf(sel.index)
    if (!leaf.text || leaf.parent.domNode.localName === "a") {
      return
    }
    let urlMatch = leaf.text.match(this.options.urlRegularExpression)
    if (!urlMatch) {
      return
    }
    let stepsBack = leaf.text.length - urlMatch.index
    let index = sel.index - stepsBack
    this.textToUrl(index, urlMatch[0])
  }
  textToUrl (index, url) {
    var isInternal = IsInternalNoteUrl(url);
    if (isInternal) {
      Meteor.call('getInternalUrlTitle', url, (err, title) => {
        if (err) {
          console.log(err, 'err getting url note title');
          const ops = new Delta()
            .retain(index)
            .delete(url.length)
            .insert(url, {link: this.normalize(url)})
          this.quill.updateContents(ops)
        } else if (!!title) {
          const ops = new Delta()
            .retain(index)
            .delete(url.length)
            .insert(title, {link: this.normalize(url)})
          this.quill.updateContents(ops)
        } else {
          const ops = new Delta()
            .retain(index)
            .delete(url.length)
            .insert(url, {link: this.normalize(url)})
          this.quill.updateContents(ops)
        }
      });
    } else {
      const ops = new Delta()
        .retain(index)
        .delete(url.length)
        .insert(url, {link: this.normalize(url)})
      this.quill.updateContents(ops)
    }
  }
  normalize (url) {
    if (this.options.normalizeRegularExpression.test(url)) {
      return normalizeUrl(url, this.options.normalizeUrlOptions)
    }
    return url
  }
}

Quill.register('modules/magicUrl', MagicUrl);

class Mention {
  constructor(quill, options) {
    this.isOpen = false;
    this.itemIndex = 0;
    this.mentionCharPos = null;
    this.cursorPos = null;
    this.values = [];
    this.suspendMouseEnter = false;

    this.quill = quill;

    this.options = {
      source: null,
      renderItem(item, searchTerm) {
        return `${item.value}`;
      },
      onSelect(item, insertItem) {
        insertItem(item);
      },
      mentionDenotationChars: ['@'],
      showDenotationChar: true,
      allowedChars: /^[a-zA-Z0-9_]*$/,
      minChars: 0,
      maxChars: 31,
      offsetTop: 2,
      offsetLeft: 0,
      isolateCharacter: false,
      fixMentionsToQuill: false,
      defaultMenuOrientation: 'bottom',
      dataAttributes: ['id', 'value', 'denotationChar', 'link', 'target'],
      linkTarget: '_blank',
      onOpen() {
        return true;
      },
      onClose() {
        return true;
      },
      // Style options
      listItemClass: 'ql-mention-list-item',
      mentionContainerClass: 'ql-mention-list-container',
      mentionListClass: 'ql-mention-list',
    };

    Object.assign(this.options, options, {
      dataAttributes: Array.isArray(options.dataAttributes)
        ? this.options.dataAttributes.concat(options.dataAttributes)
        : this.options.dataAttributes,
    });

    this.mentionContainer = document.createElement('div');
    this.mentionContainer.className = this.options.mentionContainerClass ? this.options.mentionContainerClass : '';
    this.mentionContainer.style.cssText = 'display: none; position: absolute;';
    this.mentionContainer.onmousemove = this.onContainerMouseMove.bind(this);

    if (this.options.fixMentionsToQuill) {
      this.mentionContainer.style.width = 'auto';
    }

    this.mentionList = document.createElement('ul');
    this.mentionList.className = this.options.mentionListClass ? this.options.mentionListClass : '';
    this.mentionContainer.appendChild(this.mentionList);

    this.quill.container.appendChild(this.mentionContainer);

    quill.on('text-change', this.onTextChange.bind(this));
    quill.on('selection-change', this.onSelectionChange.bind(this));

    quill.keyboard.addBinding({
      key: Keys.TAB,
    }, this.selectHandler.bind(this));
    quill.keyboard.bindings[9].unshift(quill.keyboard.bindings[9].pop());

    quill.keyboard.addBinding({
      key: Keys.ENTER,
    }, this.selectHandler.bind(this));
    quill.keyboard.bindings[13].unshift(quill.keyboard.bindings[13].pop());

    quill.keyboard.addBinding({
      key: Keys.ESCAPE,
    }, this.escapeHandler.bind(this));

    quill.keyboard.addBinding({
      key: Keys.UP,
    }, this.upHandler.bind(this));

    quill.keyboard.addBinding({
      key: Keys.DOWN,
    }, this.downHandler.bind(this));
  }

  selectHandler() {
    if (this.isOpen) {
      this.selectItem();
      return false;
    }
    return true;
  }

  escapeHandler() {
    if (this.isOpen) {
      this.hideMentionList();
      return false;
    }
    return true;
  }

  upHandler() {
    if (this.isOpen) {
      this.prevItem();
      return false;
    }
    return true;
  }

  downHandler() {
    if (this.isOpen) {
      this.nextItem();
      return false;
    }
    return true;
  }

  showMentionList() {
    this.mentionContainer.style.visibility = 'hidden';
    this.mentionContainer.style.display = '';
    this.setMentionContainerPosition();
    this.setIsOpen(true);
  }

  hideMentionList() {
    this.mentionContainer.style.display = 'none';
    this.setIsOpen(false);
  }

  highlightItem(scrollItemInView = true) {
    for (let i = 0; i < this.mentionList.childNodes.length; i += 1) {
      this.mentionList.childNodes[i].classList.remove('selected');
    }
    this.mentionList.childNodes[this.itemIndex].classList.add('selected');

    if (scrollItemInView) {
      const itemHeight = this.mentionList.childNodes[this.itemIndex].offsetHeight;
      const itemPos = this.itemIndex * itemHeight;
      const containerTop = this.mentionContainer.scrollTop;
      const containerBottom = containerTop + this.mentionContainer.offsetHeight;

      if (itemPos < containerTop) {
        // Scroll up if the item is above the top of the container
        this.mentionContainer.scrollTop = itemPos;
      } else if (itemPos > (containerBottom - itemHeight)) {
        // scroll down if any part of the element is below the bottom of the container
        this.mentionContainer.scrollTop += (itemPos - containerBottom) + itemHeight;
      }
    }
  }

  getItemData() {
    const { link } = this.mentionList.childNodes[this.itemIndex].dataset;
    const hasLinkValue = typeof link !== 'undefined';
    const itemTarget = this.mentionList.childNodes[this.itemIndex].dataset.target;
    if (hasLinkValue) {
      this.mentionList.childNodes[this.itemIndex].dataset.value = `<a href="${link}" target=${itemTarget || this.options.linkTarget}>${this.mentionList.childNodes[this.itemIndex].dataset.value}`;
    }
    return this.mentionList.childNodes[this.itemIndex].dataset;
  }

  onContainerMouseMove() {
    this.suspendMouseEnter = false;
  }

  selectItem() {
    const data = this.getItemData();
    this.options.onSelect(data, (asyncData) => {
      this.insertItem(asyncData);
    });
    this.hideMentionList();
  }

  insertItem(data) {
    const render = data;
    if (render === null) {
      return;
    }
    if (!this.options.showDenotationChar) {
      render.denotationChar = '';
    }
    var scrollTop = this.quill.scrollingContainer.scrollTop
    this.quill
      .deleteText(this.mentionCharPos, this.cursorPos - this.mentionCharPos, Quill.sources.USER);
    this.quill.insertEmbed(this.mentionCharPos, 'mention', render, Quill.sources.USER);
    this.quill.insertText(this.mentionCharPos + 1, ' ', Quill.sources.USER);
    this.quill.setSelection(this.mentionCharPos + 2, Quill.sources.USER);
    this.hideMentionList();
    this.quill.scrollingContainer.scrollTop = scrollTop
  }

  onItemMouseEnter(e) {
    if (this.suspendMouseEnter) {
      return;
    }

    const index = Number(e.target.dataset.index);

    if (!numberIsNaN(index) && index !== this.itemIndex) {
      this.itemIndex = index;
      this.highlightItem(false);
    }
  }

  onItemClick(e) {
    e.stopImmediatePropagation();
    e.preventDefault();
    this.itemIndex = e.currentTarget.dataset.index;
    this.highlightItem();
    this.selectItem();
  }

  attachDataValues(element, data) {
    const mention = element;
    Object.keys(data).forEach((key) => {
      if (this.options.dataAttributes.indexOf(key) > -1) {
        mention.dataset[key] = data[key];
      } else {
        delete mention.dataset[key];
      }
    });
    return mention;
  }

  renderList(mentionChar, data, searchTerm) {
    if (data && data.length > 0) {
      this.values = data;
      this.mentionList.innerHTML = '';

      for (let i = 0; i < data.length; i += 1) {
        const li = document.createElement('li');
        li.className = this.options.listItemClass ? this.options.listItemClass : '';
        li.dataset.index = i;
        li.innerHTML = this.options.renderItem(data[i], searchTerm);
        li.onmouseenter = this.onItemMouseEnter.bind(this);
        li.dataset.denotationChar = mentionChar;
        li.onclick = this.onItemClick.bind(this);
        this.mentionList.appendChild(this.attachDataValues(li, data[i]));
      }
      this.itemIndex = 0;
      this.highlightItem();
      this.showMentionList();
    } else {
      this.hideMentionList();
    }
  }

  nextItem() {
    this.itemIndex = (this.itemIndex + 1) % this.values.length;
    this.suspendMouseEnter = true;
    this.highlightItem();
  }

  prevItem() {
    this.itemIndex = ((this.itemIndex + this.values.length) - 1) % this.values.length;
    this.suspendMouseEnter = true;
    this.highlightItem();
  }

  hasValidChars(s) {
    return this.options.allowedChars.test(s);
  }

  containerBottomIsNotVisible(topPos, containerPos) {
    const mentionContainerBottom = topPos + this.mentionContainer.offsetHeight + containerPos.top;
    return mentionContainerBottom > window.pageYOffset + window.innerHeight;
  }

  containerRightIsNotVisible(leftPos, containerPos) {
    if (this.options.fixMentionsToQuill) {
      return false;
    }

    const rightPos = leftPos + this.mentionContainer.offsetWidth + containerPos.left;
    const browserWidth = window.pageXOffset + document.documentElement.clientWidth;
    return rightPos > browserWidth;
  }

  setIsOpen(isOpen) {
    if (this.isOpen !== isOpen) {
      if (isOpen) {
        this.options.onOpen();
      } else {
        this.options.onClose();
      }
      this.isOpen = isOpen;
    }
  }

  setMentionContainerPosition() {
    const containerPos = this.quill.container.getBoundingClientRect();
    const mentionCharPos = this.quill.getBounds(this.mentionCharPos);
    const containerHeight = this.mentionContainer.offsetHeight;

    let topPos = this.options.offsetTop;
    let leftPos = this.options.offsetLeft;

    // handle horizontal positioning
    if (this.options.fixMentionsToQuill) {
      const rightPos = 0;
      this.mentionContainer.style.right = `${rightPos}px`;
    } else {
      leftPos += mentionCharPos.left;
    }

    if (this.containerRightIsNotVisible(leftPos, containerPos)) {
      const containerWidth = this.mentionContainer.offsetWidth + this.options.offsetLeft;
      const quillWidth = containerPos.width;
      leftPos = quillWidth - containerWidth;
    }

    // handle vertical positioning
    if (this.options.defaultMenuOrientation === 'top') {
      // Attempt to align the mention container with the top of the quill editor
      if (this.options.fixMentionsToQuill) {
        topPos = -1 * (containerHeight + this.options.offsetTop);
      } else {
        topPos = mentionCharPos.top - (containerHeight + this.options.offsetTop);
      }

      // default to bottom if the top is not visible
      if (topPos + containerPos.top <= 0) {
        let overMentionCharPos = this.options.offsetTop;

        if (this.options.fixMentionsToQuill) {
          overMentionCharPos += containerPos.height;
        } else {
          overMentionCharPos += mentionCharPos.bottom;
        }

        topPos = overMentionCharPos;
      }
    } else {
      // Attempt to align the mention container with the bottom of the quill editor
      if (this.options.fixMentionsToQuill) {
        topPos += containerPos.height;
      } else {
        topPos += mentionCharPos.bottom;
      }

      // default to the top if the bottom is not visible
      if (this.containerBottomIsNotVisible(topPos, containerPos)) {
        let overMentionCharPos = this.options.offsetTop * -1;

        if (!this.options.fixMentionsToQuill) {
          overMentionCharPos += mentionCharPos.top;
        }

        topPos = overMentionCharPos - containerHeight;
      }
    }

    this.mentionContainer.style.top = `${topPos}px`;
    this.mentionContainer.style.left = `${leftPos}px`;

    this.mentionContainer.style.visibility = 'visible';
  }

  onSomethingChange() {
    const range = this.quill.getSelection();
    if (range == null) return;
    this.cursorPos = range.index;
    const startPos = Math.max(0, this.cursorPos - this.options.maxChars);
    const beforeCursorPos = this.quill.getText(startPos, this.cursorPos - startPos);
    const mentionCharIndex = this.options.mentionDenotationChars.reduce((prev, cur) => {
      const previousIndex = prev;
      const mentionIndex = beforeCursorPos.lastIndexOf(cur);

      return mentionIndex > previousIndex ? mentionIndex : previousIndex;
    }, -1);
    if (mentionCharIndex > -1) {
      if (this.options.isolateCharacter && !(mentionCharIndex === 0 || !!beforeCursorPos[mentionCharIndex - 1].match(/\s/g))) {
        this.hideMentionList();
        return;
      }
      const mentionCharPos = this.cursorPos - (beforeCursorPos.length - mentionCharIndex);
      this.mentionCharPos = mentionCharPos;
      const textAfter = beforeCursorPos.substring(mentionCharIndex + 1);
      if (textAfter.length >= this.options.minChars && this.hasValidChars(textAfter)) {
        const mentionChar = beforeCursorPos[mentionCharIndex];
        this.options.source(textAfter, this.renderList.bind(this, mentionChar), mentionChar);
      } else {
        this.hideMentionList();
      }
    } else {
      this.hideMentionList();
    }
  }

  onTextChange(delta, oldDelta, source) {
    if (source === 'user') {
      this.onSomethingChange();
    }
  }

  onSelectionChange(range) {
    if (range && range.length === 0) {
      this.onSomethingChange();
    } else {
      this.hideMentionList();
    }
  }
}

Quill.register('modules/mention', Mention);

export default Quill;
