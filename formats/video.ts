import { BlockEmbed } from '../blots/block';
import Link from './link';

const ATTRIBUTES = ['height', 'width'];

class Video extends BlockEmbed {
  static blotName = 'video';
  static className = 'ql-video';
  static tagName = 'IFRAME';

  static create(value) {
    const node = super.create(value) as Element;
    node.setAttribute('frameborder', '0');
    node.setAttribute('allowfullscreen', 'true');
    node.setAttribute('src', this.sanitize(value));
    return node;
  }

  static formats(domNode: Element) {
    return ATTRIBUTES.reduce((formats, attribute) => {
      if (domNode.hasAttribute(attribute)) {
        formats[attribute] = domNode.getAttribute(attribute);
      }
      return formats;
    }, {});
  }

  static sanitize(url: string) {
    return Link.sanitize(url); // eslint-disable-line import/no-named-as-default-member
  }

  static value(domNode: Element) {
    return domNode.getAttribute('src');
  }

  domNode: HTMLVideoElement;

  format(name, value) {
    if (ATTRIBUTES.indexOf(name) > -1) {
      if (value) {
        this.domNode.setAttribute(name, value);
      } else {
        this.domNode.removeAttribute(name);
      }
    } else {
      super.format(name, value);
    }
  }

  html() {
    const { video } = this.value();
    return `<a href="${video}">${video}</a>`;
  }
}

export default Video;
