# Content Editing Guide for Emal Kamawal Portfolio

This guide provides step-by-step instructions for updating content on your portfolio website.

---

## Quick Reference

| Content Type | Where to Edit | Access |
|-------------|--------------|--------|
| Projects | Admin Panel → Projects | `/admin/projects` |
| Publications | Admin Panel → Publications | `/admin/publications` |
| Blog Posts | Admin Panel → Blog | `/admin/blog` |
| Contact Messages | Admin Panel → Messages | `/admin/messages` |
| Access Requests | Admin Panel → Access Requests | `/admin/access-requests` |

---

## 1. Managing Projects

### Adding a New Project

1. Go to **Admin Dashboard** → **Projects** → **Add Project**
2. Fill in the required fields:
   - **Title**: Project name (appears in listings and detail page)
   - **Slug**: URL-friendly identifier (e.g., `brain-tumor-segmentation`)
   - **Short Description**: 1-2 sentence summary for cards
   - **Category**: Select one or more (AI, Healthcare, Computer Vision, etc.)
   - **Visibility**: 
     - `public` - Anyone can view
     - `gated` - Requires access request approval
     - `nda` - Hidden, for NDA-protected work

3. Add detailed content:
   - **Problem Statement**: What challenge does this solve?
   - **Approach**: Technical methodology used
   - **Results**: Outcomes and metrics
   - **Limitations**: Honest assessment and future work

4. Optional fields:
   - **GitHub Link**: Public repository URL
   - **Metrics**: Key performance indicators (accuracy, speed, etc.)
   - **Images**: Upload project screenshots or diagrams

### Visibility Settings

| Setting | Who Can See | When to Use |
|---------|-------------|-------------|
| Public | Everyone | Published research, open-source projects |
| Gated | Approved users only | Detailed case studies, proprietary work |
| NDA | Admin only | Confidential client work |

---

## 2. Managing Publications

### Adding a Publication

1. Go to **Admin Dashboard** → **Publications** → **Add Publication**
2. Required fields:
   - **Title**: Full paper title
   - **Authors**: Comma-separated (you first if primary author)
   - **Venue**: Journal or conference name
   - **Year**: Publication year
   - **Status**: Published, Under Review, or Preprint

3. Optional but recommended:
   - **DOI**: Digital Object Identifier for linking
   - **PDF URL**: Direct link to paper (if open access)
   - **Impact Factor**: Journal's IF if applicable
   - **Citations**: Update periodically

---

## 3. Blog Posts

### Creating a Blog Post

1. Go to **Admin Dashboard** → **Blog** → **New Post**
2. Write in Markdown format for best results
3. Fields:
   - **Title**: Engaging headline
   - **Slug**: URL path (auto-generated from title)
   - **Excerpt**: 2-3 sentence preview
   - **Content**: Full article in Markdown
   - **Tags**: Relevant topics for discovery
   - **Is Published**: Toggle to make visible

### Markdown Tips

```markdown
# Heading 1
## Heading 2

**Bold text** and *italic text*

- Bullet list
- Another item

1. Numbered list
2. Second item

> Blockquote for emphasis

`inline code` or code blocks:

```python
def hello():
    print("Hello, world!")
```

[Link text](https://example.com)

![Image alt text](/path/to/image.jpg)
```

---

## 4. Handling Access Requests

When someone requests access to gated content:

1. Go to **Admin Dashboard** → **Access Requests**
2. Review the request:
   - Name and institution
   - Reason for access
   - Which project they want to view
3. Actions:
   - **Approve**: Generates access token, sends email
   - **Reject**: Sends polite rejection email

### Tip: Vet requests carefully for gated research content.

---

## 5. Contact Messages

1. Go to **Admin Dashboard** → **Messages**
2. Features:
   - **Star** important messages for follow-up
   - **Mark as Read/Unread** to track what you've seen
   - **Reply** opens your email client with pre-filled details
   - **Delete** removes permanently

---

## 6. SEO Best Practices

### For Projects

- Use descriptive titles (good: "Brain Tumor Segmentation Using 3D U-Net")
- Write unique, detailed descriptions (150+ words)
- Add relevant tags and categories
- Include metrics and results

### For Blog Posts

- Titles should include keywords people search for
- Write comprehensive content (800+ words ideal)
- Use headings (H2, H3) to structure content
- Include images with descriptive alt text

---

## 7. Image Guidelines

| Type | Recommended Size | Format |
|------|------------------|--------|
| Project Hero | 1200×630px | JPEG/WebP |
| Project Screenshots | 800×600px | PNG/WebP |
| Blog Images | 800px wide | JPEG/WebP |
| Profile Photo | 400×400px | JPEG |

### Tips:
- Compress images before uploading
- Use descriptive filenames (`brain-mri-segmentation-results.jpg`)
- Always add alt text for accessibility

---

## 8. Troubleshooting

### Content not appearing?

1. Check visibility settings (is it set to `public`?)
2. Clear browser cache (Cmd+Shift+R)
3. Wait 1-2 minutes for cache refresh

### Formatting looks wrong?

1. Ensure Markdown syntax is correct
2. Preview before publishing
3. Check for unclosed tags or brackets

### Need help?

Contact your developer or open an issue in the project repository.

---

## Admin Access

- **URL**: `yoursite.com/admin`
- **Login**: Use your configured admin credentials
- **Session**: Stays logged in for 24 hours

---

*Last updated: February 2026*
